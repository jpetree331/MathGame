const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Turso client
const tursoClient = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN
});

// Initialize database tables
async function initializeDatabase() {
    try {
        console.log('Initializing database...');
        
        // Create tables
        await tursoClient.execute(`
            CREATE TABLE IF NOT EXISTS students (
                name TEXT PRIMARY KEY,
                highest_level INTEGER DEFAULT 1,
                best_accuracy REAL DEFAULT 0,
                total_sessions INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await tursoClient.execute(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY,
                student_name TEXT NOT NULL,
                level INTEGER NOT NULL,
                start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_time DATETIME,
                total_questions INTEGER DEFAULT 0,
                correct_answers INTEGER DEFAULT 0,
                accuracy REAL DEFAULT 0,
                level_passed BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (student_name) REFERENCES students(name)
            )
        `);

        await tursoClient.execute(`
            CREATE TABLE IF NOT EXISTS answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                student_name TEXT NOT NULL,
                level INTEGER NOT NULL,
                question TEXT NOT NULL,
                user_answer TEXT NOT NULL,
                correct_answer TEXT NOT NULL,
                is_correct BOOLEAN NOT NULL,
                is_first_attempt BOOLEAN DEFAULT TRUE,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(id),
                FOREIGN KEY (student_name) REFERENCES students(name)
            )
        `);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
    }
}

// API Routes

// Start a new session
app.post('/api/sessions', async (req, res) => {
    try {
        const { studentName, level } = req.body;
        
        const result = await tursoClient.execute(`
            INSERT INTO sessions (student_name, level)
            VALUES (?, ?)
        `, [studentName, level]);
        
        const sessionId = result.lastInsertRowid;
        
        res.json({ 
            success: true, 
            sessionId: sessionId,
            message: 'Session started successfully'
        });
    } catch (error) {
        console.error('Error starting session:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to start session' 
        });
    }
});

// Log an answer
app.post('/api/answers', async (req, res) => {
    try {
        const { 
            sessionId, 
            studentName, 
            level, 
            question, 
            userAnswer, 
            correctAnswer, 
            isCorrect, 
            isFirstAttempt 
        } = req.body;
        
        await tursoClient.execute(`
            INSERT INTO answers (
                session_id, student_name, level, question, 
                user_answer, correct_answer, is_correct, is_first_attempt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [sessionId, studentName, level, question, userAnswer, correctAnswer, isCorrect, isFirstAttempt]);
        
        res.json({ 
            success: true, 
            message: 'Answer logged successfully' 
        });
    } catch (error) {
        console.error('Error logging answer:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to log answer' 
        });
    }
});

// End a session
app.put('/api/sessions/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { levelPassed } = req.body;
        
        // Get session stats
        const statsResult = await tursoClient.execute(`
            SELECT 
                COUNT(*) as total_questions,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers
            FROM answers 
            WHERE session_id = ?
        `, [sessionId]);
        
        const stats = statsResult.rows[0];
        const totalQuestions = stats.total_questions || 0;
        const correctAnswers = stats.correct_answers || 0;
        const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        
        // Update session
        await tursoClient.execute(`
            UPDATE sessions 
            SET end_time = CURRENT_TIMESTAMP,
                total_questions = ?,
                correct_answers = ?,
                accuracy = ?,
                level_passed = ?
            WHERE id = ?
        `, [totalQuestions, correctAnswers, accuracy, levelPassed, sessionId]);
        
        // Update student stats
        await tursoClient.execute(`
            INSERT OR REPLACE INTO students (name, highest_level, best_accuracy, total_sessions)
            SELECT 
                s.student_name,
                MAX(s.level) as highest_level,
                MAX(s.accuracy) as best_accuracy,
                COUNT(*) as total_sessions
            FROM sessions s
            WHERE s.student_name = (SELECT student_name FROM sessions WHERE id = ?)
            GROUP BY s.student_name
        `, [sessionId]);
        
        res.json({ 
            success: true, 
            message: 'Session ended successfully',
            stats: {
                totalQuestions,
                correctAnswers,
                accuracy
            }
        });
    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to end session' 
        });
    }
});

// Get student list
app.get('/api/students', async (req, res) => {
    try {
        const result = await tursoClient.execute(`
            SELECT DISTINCT student_name 
            FROM sessions 
            ORDER BY student_name
        `);
        
        const students = result.rows.map(row => row.student_name);
        
        res.json({ 
            success: true, 
            students 
        });
    } catch (error) {
        console.error('Error getting students:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get students' 
        });
    }
});

// Get student data
app.get('/api/students/:studentName', async (req, res) => {
    try {
        const { studentName } = req.params;
        
        // Get sessions
        const sessionsResult = await tursoClient.execute(`
            SELECT 
                s.*,
                COUNT(a.id) as total_questions,
                SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers
            FROM sessions s
            LEFT JOIN answers a ON s.id = a.session_id
            WHERE s.student_name = ?
            GROUP BY s.id
            ORDER BY s.start_time DESC
        `, [studentName]);
        
        const sessions = sessionsResult.rows.map(row => ({
            id: row.id,
            student_name: row.student_name,
            level: row.level,
            start_time: row.start_time,
            end_time: row.end_time,
            total_questions: row.total_questions || 0,
            correct_answers: row.correct_answers || 0,
            accuracy: row.total_questions > 0 ? (row.correct_answers / row.total_questions) * 100 : 0,
            level_passed: row.level_passed
        }));
        
        // Get student stats
        const statsResult = await tursoClient.execute(`
            SELECT * FROM students WHERE name = ?
        `, [studentName]);
        
        const studentStats = statsResult.rows[0] || {
            name: studentName,
            highest_level: 1,
            best_accuracy: 0,
            total_sessions: 0
        };
        
        res.json({ 
            success: true, 
            sessions,
            studentStats
        });
    } catch (error) {
        console.error('Error getting student data:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get student data' 
        });
    }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const result = await tursoClient.execute(`
            SELECT 
                name,
                highest_level,
                best_accuracy,
                total_sessions
            FROM students
            ORDER BY highest_level DESC, best_accuracy DESC
            LIMIT 10
        `);
        
        const leaderboard = result.rows.map((row, index) => ({
            rank: index + 1,
            name: row.name,
            highest_level: row.highest_level,
            best_accuracy: row.best_accuracy,
            total_sessions: row.total_sessions
        }));
        
        res.json({ 
            success: true, 
            leaderboard 
        });
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get leaderboard' 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Math Game Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// Start server
async function startServer() {
    await initializeDatabase();
    
    app.listen(PORT, () => {
        console.log(`🚀 Math Game Backend running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
}

startServer().catch(console.error);
