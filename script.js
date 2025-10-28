// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://math-game-backend-production.up.railway.app/api'
    : 'http://localhost:3000/api';

console.log('API Base URL:', API_BASE_URL);

// Initialize Turso client
let tursoClient = null;

// Wait for libSQL to load before initializing
function waitForLibSQL() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkLibSQL = () => {
            attempts++;
            if (typeof libsql !== 'undefined') {
                console.log("libSQL loaded successfully");
                resolve();
            } else if (attempts >= maxAttempts) {
                reject(new Error("libSQL failed to load after 5 seconds"));
            } else {
                setTimeout(checkLibSQL, 100);
            }
        };
        
        checkLibSQL();
    });
}

// Initialize database connection
async function initializeDatabase() {
    try {
        console.log("DOM loaded, initializing database...");
        
        // Wait for libSQL to load
        await waitForLibSQL();
        
        console.log("DB_CONFIG loaded:", {
            url: DB_CONFIG.url,
            hasToken: !!DB_CONFIG.authToken,
            tokenLength: DB_CONFIG.authToken ? DB_CONFIG.authToken.length : 0
        });
        
        // Create Turso client
        tursoClient = libsql.createClient({
            url: DB_CONFIG.url,
            authToken: DB_CONFIG.authToken
        });

        // Create tables if they don't exist
        await createTables();
        console.log("Database initialized successfully");
        return true;
    } catch (error) {
        console.error("Database initialization failed:", error);
        // Fallback to localStorage for offline mode
        console.log("Falling back to localStorage for offline mode");
        tursoClient = null; // Ensure tursoClient is null for localStorage mode
        return false;
    }
}

// Create database tables
async function createTables() {
    if (!tursoClient) return;

    try {
        // Create students table
        await tursoClient.execute(`
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                highest_level INTEGER DEFAULT 1,
                best_accuracy REAL DEFAULT 0.0,
                total_sessions INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create sessions table
        await tursoClient.execute(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_name TEXT NOT NULL,
                level INTEGER NOT NULL,
                start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_time DATETIME,
                total_questions INTEGER DEFAULT 0,
                correct_answers INTEGER DEFAULT 0,
                accuracy REAL DEFAULT 0.0,
                level_passed BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (student_name) REFERENCES students(name)
            )
        `);

        // Create answers table
        await tursoClient.execute(`
            CREATE TABLE IF NOT EXISTS answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER,
                student_name TEXT NOT NULL,
                level INTEGER NOT NULL,
                question TEXT NOT NULL,
                user_answer INTEGER,
                correct_answer INTEGER NOT NULL,
                is_correct BOOLEAN NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(id),
                FOREIGN KEY (student_name) REFERENCES students(name)
            )
        `);
    } catch (error) {
        console.error("Error creating tables:", error);
    }
}

// Level Configuration - Mixed Operations for 4th-5th Grade
const LEVEL_CONFIG = {
    1: { 
        operations: ['multiplication'], 
        min: 0, max: 5, 
        description: "Easy Multiplication (0-5)" 
    },
    2: { 
        operations: ['multiplication'], 
        min: 0, max: 7, 
        description: "Easy+ Multiplication (0-7)" 
    },
    3: { 
        operations: ['multiplication', 'addition'], 
        min: 0, max: 10, 
        description: "Mixed: × and + (0-10)" 
    },
    4: { 
        operations: ['multiplication', 'addition', 'subtraction'], 
        min: 2, max: 12, 
        description: "Mixed: ×, +, - (2-12)" 
    },
    5: { 
        operations: ['multiplication', 'addition', 'subtraction'], 
        min: 5, max: 12, 
        description: "Mixed: ×, +, - (5-12)" 
    },
    6: { 
        operations: ['multiplication', 'division'], 
        min: 7, max: 12, 
        description: "Mixed: × and ÷ (7-12)" 
    },
    7: { 
        operations: ['multiplication', 'division', 'addition'], 
        min: 9, max: 12, 
        description: "Mixed: ×, ÷, + (9-12)" 
    },
    8: { 
        operations: ['multiplication', 'division', 'subtraction'], 
        min: 10, max: 12, 
        description: "Mixed: ×, ÷, - (10-12)" 
    },
    9: { 
        operations: ['multiplication', 'division', 'addition', 'subtraction'], 
        min: 11, max: 12, 
        description: "All Operations (11-12)" 
    },
    10: { 
        operations: ['multiplication', 'division', 'addition', 'subtraction'], 
        min: 12, max: 12, 
        description: "Master All Operations (12)" 
    }
};

// Sound Manager
class SoundManager {
    constructor() {
        this.nyanCatSound = new Audio('Nyan-Cat.mp3');
        this.nyanCatSound.volume = 0.25; // Set volume to 25% (50% of previous 50%)
        this.errorSound = new Audio('error-win.mp3');
        this.soundsEnabled = true;
    }

    playNyanCat() {
        if (this.soundsEnabled) {
            this.nyanCatSound.play().catch(e => console.log("Could not play nyan cat sound:", e));
        }
    }

    playError() {
        if (this.soundsEnabled) {
            this.errorSound.play().catch(e => console.log("Could not play error sound:", e));
        }
    }
}

// Session Manager
class SessionManager {
    constructor() {
        this.currentSessionId = null;
        this.sessionStartTime = null;
        this.sessionAnswers = [];
        this.currentStudent = null;
        this.currentLevel = 1;
    }

    async startSession(studentName, level = 1) {
        try {
            this.currentStudent = studentName;
            this.currentLevel = level;
            
            const response = await fetch(`${API_BASE_URL}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentName,
                    level
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentSessionId = result.sessionId;
                this.sessionStartTime = new Date();
                this.sessionAnswers = [];
                console.log("Session started:", this.currentSessionId);
            } else {
                throw new Error(result.error || 'Failed to start session');
            }
        } catch (error) {
            console.error("Error starting session:", error);
            // Fallback to localStorage
            this.currentSessionId = Date.now();
            this.sessionStartTime = new Date();
            this.sessionAnswers = [];
            console.log("Session started (localStorage fallback):", this.currentSessionId);
        }
    }

    async endSession(levelPassed = false) {
        console.log('Ending session:', this.currentSessionId, 'levelPassed:', levelPassed);
        console.log('Session answers:', this.sessionAnswers);
        
        if (!this.currentSessionId) {
            console.log('No active session to end');
            return;
        }

        try {
            const endTime = new Date();
            const totalQuestions = this.sessionAnswers.length;
            const correctAnswers = this.sessionAnswers.filter(a => a.is_correct).length;
            const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
            
            console.log('Session stats - Total questions:', totalQuestions, 'Correct:', correctAnswers, 'Accuracy:', accuracy);

            if (tursoClient) {
                await tursoClient.execute(`
                    UPDATE sessions 
                    SET end_time = CURRENT_TIMESTAMP, 
                        total_questions = ?, 
                        correct_answers = ?, 
                        accuracy = ?,
                        level_passed = ?
                    WHERE id = ?
                `, [totalQuestions, correctAnswers, accuracy, levelPassed, this.currentSessionId]);

                // Update student stats
                await this.updateStudentStats(levelPassed);
            } else {
                console.log('Saving to localStorage...');
                // Save to localStorage
                const sessionData = {
                    id: this.currentSessionId,
                    student_name: this.currentStudent,
                    level: this.currentLevel,
                    start_time: this.sessionStartTime,
                    end_time: endTime,
                    total_questions: totalQuestions,
                    correct_answers: correctAnswers,
                    accuracy: accuracy,
                    level_passed: levelPassed,
                    answers: this.sessionAnswers
                };
                
                console.log('Session data to save:', sessionData);
                
                const sessions = JSON.parse(localStorage.getItem('timesTableSessions') || '[]');
                sessions.push(sessionData);
                localStorage.setItem('timesTableSessions', JSON.stringify(sessions));
                console.log('Session saved to localStorage. Total sessions:', sessions.length);
            }

            console.log("Session ended:", this.currentSessionId);
            this.currentSessionId = null;
            this.sessionAnswers = [];
        } catch (error) {
            console.error("Error ending session:", error);
        }
    }

    async updateStudentStats(levelPassed) {
        if (!tursoClient || !this.currentStudent) return;

        try {
            // Update or insert student
            await tursoClient.execute(`
                INSERT OR REPLACE INTO students (name, highest_level, best_accuracy, total_sessions)
                VALUES (
                    ?,
                    COALESCE((SELECT MAX(highest_level) FROM students WHERE name = ?), 1),
                    COALESCE((SELECT MAX(best_accuracy) FROM students WHERE name = ?), 0.0),
                    COALESCE((SELECT total_sessions + 1 FROM students WHERE name = ?), 1)
                )
            `, [this.currentStudent, this.currentStudent, this.currentStudent, this.currentStudent]);

            // Update highest level if level was passed
            if (levelPassed) {
                await tursoClient.execute(`
                    UPDATE students 
                    SET highest_level = MAX(highest_level, ?)
                    WHERE name = ?
                `, [this.currentLevel + 1, this.currentStudent]);
            }
        } catch (error) {
            console.error("Error updating student stats:", error);
        }
    }

    async logAnswer(question, userAnswer, correctAnswer, isCorrect) {
        if (!this.currentSessionId) return;

        const answerData = {
            session_id: this.currentSessionId,
            student_name: this.currentStudent,
            level: this.currentLevel,
            question: question,
            user_answer: userAnswer,
            correct_answer: correctAnswer,
            is_correct: isCorrect,
            timestamp: new Date()
        };

        this.sessionAnswers.push(answerData);

        try {
            if (tursoClient) {
                await tursoClient.execute(`
                    INSERT INTO answers (session_id, student_name, level, question, user_answer, correct_answer, is_correct)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [this.currentSessionId, this.currentStudent, this.currentLevel, question, userAnswer, correctAnswer, isCorrect]);
            }
        } catch (error) {
            console.error("Error logging answer:", error);
        }
    }
}

// Main Game Class
class TimesTableGame {
    constructor() {
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.totalQuestions = 20; // 20 questions per level
        this.currentLevel = 1;
        this.lives = 4;
        this.sessionManager = new SessionManager();
        this.soundManager = new SoundManager();
        this.currentView = 'start'; // 'start', 'name', 'game', 'levelComplete', 'data'
        this.currentStudent = null;
        this.questionAttempts = new Map(); // Track attempts per question
        
        this.initializeElements();
        this.setupEventListeners();
        this.showStartScreen();
    }
    
    initializeElements() {
        // Start screen elements
        this.startScreen = document.getElementById('startScreen');
        this.startGameBtn = document.getElementById('startGameBtn');
        this.viewDataBtn = document.getElementById('viewDataBtn');
        
        console.log('Initializing elements...');
        console.log('startScreen:', this.startScreen);
        console.log('startGameBtn:', this.startGameBtn);
        console.log('viewDataBtn:', this.viewDataBtn);
        
        // Student name screen elements
        this.studentNameScreen = document.getElementById('studentNameScreen');
        this.studentNameInput = document.getElementById('studentNameInput');
        this.confirmNameBtn = document.getElementById('confirmNameBtn');
        
        // Game area elements
        this.gameArea = document.getElementById('gameArea');
        this.studentNameDisplay = document.getElementById('studentNameDisplay');
        this.levelDisplay = document.getElementById('levelDisplay');
        this.questionProgress = document.getElementById('questionProgress');
        this.heartsContainer = document.getElementById('heartsContainer');
        this.endSessionBtn = document.getElementById('endSessionBtn');
        this.questionText = document.getElementById('questionText');
        this.answerInput = document.getElementById('answerInput');
        this.submitBtn = document.getElementById('submitBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        
        
        // Level complete screen elements
        this.levelCompleteScreen = document.getElementById('levelCompleteScreen');
        this.levelCompleteTitle = document.getElementById('levelCompleteTitle');
        this.correctCount = document.getElementById('correctCount');
        this.levelAccuracy = document.getElementById('levelAccuracy');
        this.completedLevel = document.getElementById('completedLevel');
        this.levelResult = document.getElementById('levelResult');
        this.nyanCatContainer = document.getElementById('nyanCatContainer');
        this.nextLevelBtn = document.getElementById('nextLevelBtn');
        this.retryLevelBtn = document.getElementById('retryLevelBtn');
        this.backToStartFromLevelBtn = document.getElementById('backToStartFromLevelBtn');
        
        // Data view elements
        this.dataView = document.getElementById('dataView');
        this.backToStartBtn = document.getElementById('backToStartBtn');
        this.studentSelection = document.getElementById('studentSelection');
        this.studentList = document.getElementById('studentList');
        this.totalSessions = document.getElementById('totalSessions');
        this.totalQuestionsCount = document.getElementById('totalQuestionsCount');
        this.overallAccuracy = document.getElementById('overallAccuracy');
        this.bestSession = document.getElementById('bestSession');
        this.sessionsList = document.getElementById('sessionsList');
        this.leaderboard = document.getElementById('leaderboard');
        
        // Popup elements
        this.feedbackPopup = document.getElementById('feedbackPopup');
        this.feedbackText = document.getElementById('feedbackText');
        this.closePopup = document.getElementById('closePopup');
        this.confettiContainer = document.getElementById('confettiContainer');
        this.flashCard = document.getElementById('flashCard');
    }
    
    showStartScreen() {
        this.currentView = 'start';
        this.startScreen.style.display = 'block';
        this.studentNameScreen.style.display = 'none';
        this.gameArea.style.display = 'none';
        this.levelCompleteScreen.style.display = 'none';
        this.dataView.style.display = 'none';
    }
    
    showStudentNameScreen() {
        this.currentView = 'name';
        this.startScreen.style.display = 'none';
        this.studentNameScreen.style.display = 'block';
        this.gameArea.style.display = 'none';
        this.levelCompleteScreen.style.display = 'none';
        this.dataView.style.display = 'none';
        this.studentNameInput.focus();
    }
    
    async startGame() {
        this.currentView = 'game';
        this.startScreen.style.display = 'none';
        this.studentNameScreen.style.display = 'none';
        this.gameArea.style.display = 'block';
        this.levelCompleteScreen.style.display = 'none';
        this.dataView.style.display = 'none';
        
        // For testing: Start at Level 3 to see mixed operations
        // this.currentLevel = 3;
        
        await this.sessionManager.startSession(this.currentStudent, this.currentLevel);
        this.generateQuestions();
        this.displayCurrentQuestion();
        this.updateUI();
    }
    
    async showLevelCompleteScreen() {
        this.currentView = 'levelComplete';
        this.startScreen.style.display = 'none';
        this.studentNameScreen.style.display = 'none';
        this.gameArea.style.display = 'none';
        this.levelCompleteScreen.style.display = 'block';
        this.dataView.style.display = 'none';
        
        const accuracy = Math.round((this.score / this.totalQuestions) * 100);
        const levelPassed = accuracy >= 80;
        
        console.log('Level complete - Score:', this.score, 'Total Questions:', this.totalQuestions, 'Accuracy:', accuracy + '%');
        
        // Update display
        this.correctCount.textContent = this.score;
        this.levelAccuracy.textContent = accuracy + '%';
        this.completedLevel.textContent = this.currentLevel;
        
        // Show result
        if (accuracy === 100) {
            this.levelResult.textContent = '🌟 Perfect Score! 🌟';
            this.levelResult.className = 'level-result success';
            this.nyanCatContainer.style.display = 'block';
            this.soundManager.playNyanCat();
            
            // Hide nyan cat after 8 seconds
            setTimeout(() => {
                this.nyanCatContainer.style.display = 'none';
            }, 8000);
        } else if (levelPassed) {
            this.levelResult.textContent = '🎉 Level Passed! 🎉';
            this.levelResult.className = 'level-result success';
        } else {
            this.levelResult.textContent = '💪 Keep Trying! 💪';
            this.levelResult.className = 'level-result failure';
        }
        
        // Show appropriate buttons
        if (levelPassed) {
            this.nextLevelBtn.style.display = 'inline-block';
            this.retryLevelBtn.style.display = 'none';
        } else {
            this.nextLevelBtn.style.display = 'none';
            this.retryLevelBtn.style.display = 'inline-block';
        }
        
        // End session
        await this.sessionManager.endSession(levelPassed);
    }
    
    async showDataView() {
        this.currentView = 'data';
        this.startScreen.style.display = 'none';
        this.studentNameScreen.style.display = 'none';
        this.gameArea.style.display = 'none';
        this.levelCompleteScreen.style.display = 'none';
        this.dataView.style.display = 'block';
        
        await this.loadStudentList();
    }
    
    generateQuestions() {
        this.questions = [];
        const config = LEVEL_CONFIG[this.currentLevel];
        
        console.log(`Generating questions for Level ${this.currentLevel}: ${config.description}`);
        console.log(`Available operations: ${config.operations.join(', ')}`);
        
        // Generate 20 questions for current level with better operation distribution
        const operations = config.operations;
        const questionsPerOperation = Math.floor(this.totalQuestions / operations.length);
        const remainingQuestions = this.totalQuestions % operations.length;
        
        // Create arrays for each operation type
        const operationQuestions = {};
        operations.forEach(op => operationQuestions[op] = []);
        
        // Generate questions for each operation
        for (let opIndex = 0; opIndex < operations.length; opIndex++) {
            const operation = operations[opIndex];
            const questionsForThisOp = questionsPerOperation + (opIndex < remainingQuestions ? 1 : 0);
            
            console.log(`Generating ${questionsForThisOp} questions for operation: ${operation}`);
            
            for (let i = 0; i < questionsForThisOp; i++) {
                let question, answer;
                
                if (operation === 'multiplication') {
                    const multiplicand = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
                    const multiplier = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
                    answer = multiplicand * multiplier;
                    question = `${multiplicand} × ${multiplier} = ?`;
                } else if (operation === 'division') {
                    // Generate division problems that result in whole numbers
                    const divisor = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
                    if (divisor === 0) divisor = 1; // Avoid division by zero
                    const quotient = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
                    const dividend = divisor * quotient;
                    answer = quotient;
                    question = `${dividend} ÷ ${divisor} = ?`;
                } else if (operation === 'addition') {
                    const addend1 = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
                    const addend2 = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
                    answer = addend1 + addend2;
                    question = `${addend1} + ${addend2} = ?`;
                } else if (operation === 'subtraction') {
                    // Ensure positive results for subtraction
                    const minuend = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
                    const subtrahend = Math.floor(Math.random() * (minuend + 1));
                    answer = minuend - subtrahend;
                    question = `${minuend} - ${subtrahend} = ?`;
                }
                
                operationQuestions[operation].push({
                    operation: operation,
                    question: question,
                    answer: answer
                });
            }
        }
        
        // Interleave questions from different operations for better mixing
        let maxLength = Math.max(...Object.values(operationQuestions).map(arr => arr.length));
        for (let i = 0; i < maxLength; i++) {
            operations.forEach(operation => {
                if (operationQuestions[operation][i]) {
                    this.questions.push(operationQuestions[operation][i]);
                }
            });
        }
        
        // Debug: Show the order of questions after interleaving
        console.log('Questions after interleaving:');
        this.questions.forEach((q, index) => {
            console.log(`${index + 1}. ${q.question} (${q.operation})`);
        });
        
        this.currentIndex = 0;
        this.score = 0;
        this.lives = 4;
        this.questionAttempts.clear(); // Reset attempts tracking
        this.updateHearts();
    }
    
    shuffleQuestions() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }
    
    displayCurrentQuestion() {
        if (this.questions.length === 0) return;
        
        const currentQuestion = this.questions[this.currentIndex];
        if (this.questionText) {
        this.questionText.textContent = currentQuestion.question;
        }
        if (this.answerInput) {
        this.answerInput.value = '';
        this.answerInput.focus();
        }
        
        // Add flip animation
        if (this.flashCard) {
        this.flashCard.classList.add('card-flip');
        setTimeout(() => {
            this.flashCard.classList.remove('card-flip');
        }, 600);
        }
    }
    
    async checkAnswer() {
        const userAnswer = parseInt(this.answerInput.value);
        const currentQuestion = this.questions[this.currentIndex];
        const correctAnswer = currentQuestion.answer;
        const question = currentQuestion.question;
        const operation = currentQuestion.operation;
        
        if (isNaN(userAnswer)) {
            this.showFeedback('Please enter a number!', 'error');
            return;
        }
        
        const isCorrect = userAnswer === correctAnswer;
        const questionKey = `${this.currentIndex}-${question}`;
        const isFirstAttempt = !this.questionAttempts.has(questionKey);
        
        // Track this attempt
        this.questionAttempts.set(questionKey, true);
        
        // Log answer to database
        await this.sessionManager.logAnswer(question, userAnswer, correctAnswer, isCorrect);
        
        if (isCorrect) {
            // Only give points for first attempts
            if (isFirstAttempt) {
            this.score++;
                console.log('Correct answer on first attempt! Score is now:', this.score);
            } else {
                console.log('Correct answer on retry - no points awarded. Score remains:', this.score);
            }
            this.showConfetti();
            this.showFeedback('🎉 Correct! Well done! 🎉', 'success');
            setTimeout(() => {
                this.nextQuestion();
            }, 1500);
        } else {
            this.lives--;
            this.updateHearts();
            this.soundManager.playError();
            this.showFeedback('❌ Try again! The correct answer is ' + correctAnswer, 'error');
            
            if (this.lives <= 0) {
                setTimeout(() => {
                    this.showLevelCompleteScreen();
                }, 2000);
            }
        }
    }
    
    nextQuestion() {
        if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex++;
            this.displayCurrentQuestion();
            this.updateUI();
        } else {
            this.showLevelCompleteScreen();
        }
    }
    
    previousQuestion() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.displayCurrentQuestion();
            this.updateUI();
        }
    }
    
    updateUI() {
        if (this.questionProgress) {
            this.questionProgress.textContent = `Question ${this.currentIndex + 1}/${this.totalQuestions}`;
        }
        if (this.levelDisplay) {
            this.levelDisplay.textContent = `Level ${this.currentLevel}`;
        }
        if (this.studentNameDisplay) {
            this.studentNameDisplay.textContent = this.currentStudent;
        }
    }
    
    updateHearts() {
        const hearts = this.heartsContainer.querySelectorAll('.heart');
        hearts.forEach((heart, index) => {
            if (index < this.lives) {
                heart.classList.remove('lost');
            } else {
                heart.classList.add('lost');
            }
        });
    }
    
    showFeedback(message, type) {
        this.feedbackText.textContent = message;
        this.feedbackText.className = type;
        this.feedbackPopup.style.display = 'flex';
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                this.hideFeedback();
            }, 2000);
        }
    }
    
    hideFeedback() {
        this.feedbackPopup.style.display = 'none';
    }
    
    showConfetti() {
        // Clear existing confetti
        this.confettiContainer.innerHTML = '';
        
        // Create confetti pieces
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            this.confettiContainer.appendChild(confetti);
        }
        
        // Remove confetti after animation
        setTimeout(() => {
            this.confettiContainer.innerHTML = '';
        }, 5000);
    }
    
    async nextLevel() {
        this.currentLevel++;
        await this.startGame();
    }
    
    async retryLevel() {
        await this.startGame();
    }
    
    async loadStudentList() {
        try {
            let students = [];
            
            if (tursoClient) {
                const result = await tursoClient.execute(`
                    SELECT DISTINCT student_name FROM sessions
                    ORDER BY student_name
                `);
                students = result.rows.map(row => row.student_name);
            } else {
                // Load from localStorage
                console.log('Loading student list from localStorage');
                const sessions = JSON.parse(localStorage.getItem('timesTableSessions') || '[]');
                console.log('All sessions for student list:', sessions);
                students = [...new Set(sessions.map(s => s.student_name))];
                console.log('Unique student names:', students);
            }
            
            this.displayStudentList(students);
        } catch (error) {
            console.error("Error loading student list:", error);
        }
    }
    
    displayStudentList(students) {
        this.studentList.innerHTML = '';
        
        if (students.length === 0) {
            this.studentList.innerHTML = '<p>No students found. Start playing to create student data!</p>';
            return;
        }
        
        students.forEach(studentName => {
            const studentDiv = document.createElement('div');
            studentDiv.className = 'student-item';
            studentDiv.textContent = studentName;
            studentDiv.addEventListener('click', () => this.loadStudentData(studentName));
            this.studentList.appendChild(studentDiv);
        });
    }
    
    async loadStudentData(studentName) {
        try {
            let sessions = [];
            
            if (tursoClient) {
                const sessionsResult = await tursoClient.execute(`
                    SELECT s.*, 
                           COUNT(a.id) as total_questions,
                           SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers
                    FROM sessions s
                    LEFT JOIN answers a ON s.id = a.session_id
                    WHERE s.student_name = ?
                    GROUP BY s.id
                    ORDER BY s.start_time DESC
                `, [studentName]);
                
                sessions = sessionsResult.rows.map(row => ({
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
        } else {
                // Load from localStorage
                console.log('Loading from localStorage for student:', studentName);
                const allSessions = JSON.parse(localStorage.getItem('timesTableSessions') || '[]');
                console.log('All sessions in localStorage:', allSessions);
                sessions = allSessions.filter(s => s.student_name === studentName);
                console.log('Filtered sessions for', studentName, ':', sessions);
            }
            
            this.displayStudentProgress(studentName, sessions);
            await this.loadLeaderboard();
        } catch (error) {
            console.error("Error loading student data:", error);
        }
    }
    
    displayStudentProgress(studentName, sessions) {
        if (sessions.length === 0) {
            this.totalSessions.textContent = '0';
            this.totalQuestionsCount.textContent = '0';
            this.overallAccuracy.textContent = '0%';
            this.bestSession.textContent = '0%';
            this.sessionsList.innerHTML = '<p>No sessions yet. Start practicing to see your progress!</p>';
            return;
        }
        
        // Calculate statistics
        const totalSessionsCount = sessions.length;
        const totalQuestionsCount = sessions.reduce((sum, session) => sum + session.total_questions, 0);
        const totalCorrectAnswers = sessions.reduce((sum, session) => sum + session.correct_answers, 0);
        const overallAccuracyPercent = totalQuestionsCount > 0 ? 
            Math.round((totalCorrectAnswers / totalQuestionsCount) * 100) : 0;
        const bestSessionAccuracy = Math.max(...sessions.map(s => s.accuracy || 0));
        
        // Update statistics display
        this.totalSessions.textContent = totalSessionsCount;
        this.totalQuestionsCount.textContent = totalQuestionsCount;
        this.overallAccuracy.textContent = overallAccuracyPercent + '%';
        this.bestSession.textContent = Math.round(bestSessionAccuracy) + '%';
        
        // Display recent sessions
        this.displayRecentSessions(sessions.slice(0, 10));
        
        // Create charts
        this.createCharts(sessions);
    }
    
    displayRecentSessions(sessions) {
        this.sessionsList.innerHTML = '';
        
        sessions.forEach(session => {
            const sessionDiv = document.createElement('div');
            sessionDiv.className = 'session-item';
            
            const date = new Date(session.start_time).toLocaleDateString();
            const accuracy = Math.round(session.accuracy || 0);
            const levelPassed = session.level_passed ? '✅' : '❌';
            
            sessionDiv.innerHTML = `
                <div class="session-date">${date} - Level ${session.level} ${levelPassed}</div>
                <div class="session-stats">
                    <span>Questions: ${session.total_questions}</span>
                    <span>Correct: ${session.correct_answers}</span>
                    <span>Accuracy: ${accuracy}%</span>
                </div>
            `;
            
            this.sessionsList.appendChild(sessionDiv);
        });
    }
    
    async loadLeaderboard() {
        try {
            let students = [];
            
            if (tursoClient) {
                const result = await tursoClient.execute(`
                    SELECT name, highest_level, best_accuracy, total_sessions
                    FROM students
                    ORDER BY highest_level DESC, best_accuracy DESC
                    LIMIT 10
                `);
                students = result.rows.map(row => ({
                    name: row.name,
                    highest_level: row.highest_level,
                    best_accuracy: row.best_accuracy,
                    total_sessions: row.total_sessions
                }));
            } else {
                // Load from localStorage
                const sessions = JSON.parse(localStorage.getItem('timesTableSessions') || '[]');
                const studentStats = {};
                
                sessions.forEach(session => {
                    if (!studentStats[session.student_name]) {
                        studentStats[session.student_name] = {
                            name: session.student_name,
                            highest_level: 1,
                            best_accuracy: 0,
                            total_sessions: 0
                        };
                    }
                    
                    studentStats[session.student_name].total_sessions++;
                    studentStats[session.student_name].best_accuracy = Math.max(
                        studentStats[session.student_name].best_accuracy,
                        session.accuracy || 0
                    );
                    
                    if (session.level_passed) {
                        studentStats[session.student_name].highest_level = Math.max(
                            studentStats[session.student_name].highest_level,
                            session.level + 1
                        );
                    }
                });
                
                students = Object.values(studentStats).sort((a, b) => 
                    b.highest_level - a.highest_level || b.best_accuracy - a.best_accuracy
                );
            }
            
            this.displayLeaderboard(students);
        } catch (error) {
            console.error("Error loading leaderboard:", error);
        }
    }
    
    displayLeaderboard(students) {
        this.leaderboard.innerHTML = '';
        
        students.forEach((student, index) => {
            const rankDiv = document.createElement('div');
            rankDiv.className = 'leaderboard-item';
            
            if (index === 0) rankDiv.classList.add('first');
            else if (index === 1) rankDiv.classList.add('second');
            else if (index === 2) rankDiv.classList.add('third');
            
            rankDiv.innerHTML = `
                <div class="leaderboard-rank">${index + 1}</div>
                <div class="leaderboard-name">${student.name}</div>
                <div class="leaderboard-stats">
                    <span>Level: ${student.highest_level}</span>
                    <span>Best: ${Math.round(student.best_accuracy)}%</span>
                    <span>Sessions: ${student.total_sessions}</span>
                </div>
            `;
            
            this.leaderboard.appendChild(rankDiv);
        });
    }
    
    createCharts(sessions) {
        // Accuracy over time chart
        const accuracyCtx = document.getElementById('accuracyChart').getContext('2d');
        const accuracyData = sessions.map(s => Math.round(s.accuracy || 0));
        const accuracyLabels = sessions.map(s => new Date(s.start_time).toLocaleDateString());
        
        new Chart(accuracyCtx, {
            type: 'line',
            data: {
                labels: accuracyLabels,
                datasets: [{
                    label: 'Accuracy %',
                    data: accuracyData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
        
        // Questions per session chart
        const questionsCtx = document.getElementById('questionsChart').getContext('2d');
        const questionsData = sessions.map(s => s.total_questions);
        
        new Chart(questionsCtx, {
            type: 'bar',
            data: {
                labels: accuracyLabels,
                datasets: [{
                    label: 'Questions Answered',
                    data: questionsData,
                    backgroundColor: '#48bb78',
                    borderColor: '#38a169',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    setupEventListeners() {
        // Start screen events
        console.log('Setting up event listeners...');
        console.log('startGameBtn element:', this.startGameBtn);
        console.log('viewDataBtn element:', this.viewDataBtn);
        
        if (this.startGameBtn) {
            this.startGameBtn.addEventListener('click', () => {
                console.log('Start Game button clicked!');
                this.showStudentNameScreen();
            });
        } else {
            console.error('startGameBtn not found!');
        }
        
        if (this.viewDataBtn) {
            this.viewDataBtn.addEventListener('click', () => this.showDataView());
        } else {
            console.error('viewDataBtn not found!');
        }
        
        // Student name screen events
        this.confirmNameBtn.addEventListener('click', () => {
            const name = this.studentNameInput.value.trim();
            if (name) {
                this.currentStudent = name;
                this.startGame();
            } else {
                alert('Please enter your name!');
            }
        });
        
        this.studentNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.confirmNameBtn.click();
            }
        });
        
        // Game events
        this.submitBtn.addEventListener('click', () => this.checkAnswer());
        
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
        
        this.prevBtn.addEventListener('click', () => this.previousQuestion());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        
        this.shuffleBtn.addEventListener('click', () => {
            this.shuffleQuestions();
            this.currentIndex = 0;
            this.displayCurrentQuestion();
            this.updateUI();
        });
        
        this.newGameBtn.addEventListener('click', () => this.startGame());
        this.endSessionBtn.addEventListener('click', () => {
            console.log('End Session button clicked');
            this.sessionManager.endSession();
            this.showStartScreen();
        });
        
        // Level complete screen events
        this.nextLevelBtn.addEventListener('click', () => this.nextLevel());
        this.retryLevelBtn.addEventListener('click', () => this.retryLevel());
        this.backToStartFromLevelBtn.addEventListener('click', () => this.showStartScreen());
        
        // Data view events
        this.backToStartBtn.addEventListener('click', () => this.showStartScreen());
        
        // Popup events
        this.closePopup.addEventListener('click', () => this.hideFeedback());
        
        // Close popup when clicking outside
        this.feedbackPopup.addEventListener('click', (e) => {
            if (e.target === this.feedbackPopup) {
                this.hideFeedback();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.currentView === 'game') {
            if (e.key === 'ArrowLeft') {
                this.previousQuestion();
            } else if (e.key === 'ArrowRight') {
                this.nextQuestion();
            } else if (e.key === 'Escape') {
                this.hideFeedback();
                }
            }
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, starting initialization...');
    
    try {
        const dbInitialized = await initializeDatabase();
        console.log('Database initialization result:', dbInitialized);
    } catch (error) {
        console.error('Database initialization error:', error);
    }
    
    console.log('Creating game...');
    
    // Create game instance
    window.game = new TimesTableGame();
    console.log('Game created:', window.game);
    
    // Test that the game is working
    console.log('Game ready - you can now click Start Game!');
});
