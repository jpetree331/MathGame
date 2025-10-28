# Times Tables Practice - Enhanced Level-Based Game

## Overview
This enhanced times table practice app now features a complete level-based progression system with student tracking, lives system, sound effects, and comprehensive analytics. Students progress through 10 levels of increasing difficulty, with each level requiring 80% accuracy to advance.

## 🎮 New Game Features

### Level System
- **10 Progressive Levels**: From easy (0-5) to legendary (12×12)
- **20 Questions Per Level**: Consistent challenge length
- **80% Pass Requirement**: Must get 16/20 correct to advance
- **Level Descriptions**: Clear difficulty indicators

### Lives System
- **4 Hearts**: Visual life indicator
- **Lose Life on Wrong Answer**: One heart disappears per mistake
- **Lives Reset Each Level**: Fresh start for each level
- **Game Over**: Lose all lives = level failed

### Student Tracking
- **Name Input**: Students enter their name before playing
- **Individual Progress**: Each student's data tracked separately
- **Highest Level Achieved**: Tracks personal best
- **Session History**: Complete record of all attempts

### Sound Effects & Celebrations
- **Error Sound**: Plays when answer is wrong (`error-win.mp3`)
- **Nyan Cat Celebration**: Plays for 100% perfect scores (`Nyan-Cat.mp3`)
- **Nyan Cat Animation**: 8-second rainbow GIF celebration
- **Visual Confetti**: For correct answers

### Leaderboard System
- **Top 10 Students**: Ranked by highest level achieved
- **Multiple Metrics**: Level, best accuracy, total sessions
- **Visual Rankings**: Gold, silver, bronze styling
- **Real-time Updates**: Updates after each session

## 📊 Enhanced Analytics

### Student Selection
- **Student List**: Click on any student name to view their data
- **Individual Progress**: Personal statistics and charts
- **Session History**: Detailed breakdown of all attempts

### Progress Tracking
- **Accuracy Over Time**: Line chart showing improvement
- **Questions Per Session**: Bar chart of engagement
- **Level Progression**: Track advancement through levels
- **Best Performance**: Highlight personal achievements

## 🗄️ Database Schema

### Students Table
- `id`: Primary key
- `name`: Student name (unique)
- `highest_level`: Best level achieved
- `best_accuracy`: Highest accuracy percentage
- `total_sessions`: Number of sessions played
- `created_at`: When student first played

### Sessions Table
- `id`: Primary key
- `student_name`: Foreign key to students
- `level`: Level attempted
- `start_time`: Session start
- `end_time`: Session end
- `total_questions`: Questions answered
- `correct_answers`: Correct answers
- `accuracy`: Percentage accuracy
- `level_passed`: Whether level was passed

### Answers Table
- `id`: Primary key
- `session_id`: Foreign key to sessions
- `student_name`: Student who answered
- `level`: Level of the question
- `question`: The multiplication question
- `user_answer`: Student's answer
- `correct_answer`: Correct answer
- `is_correct`: Whether answer was correct
- `timestamp`: When answered

## 🎯 Level Configuration

| Level | Range | Description | Difficulty |
|-------|-------|-------------|------------|
| 1 | 0-5 | Easy | Beginner |
| 2 | 0-7 | Easy+ | Beginner+ |
| 3 | 0-10 | Medium | Intermediate |
| 4 | 2-12 | Medium+ | Intermediate+ |
| 5 | 5-12 | Hard | Advanced |
| 6 | 7-12 | Hard+ | Advanced+ |
| 7 | 9-12 | Expert | Expert |
| 8 | 10-12 | Master | Master |
| 9 | 11-12 | Grand Master | Grand Master |
| 10 | 12×12 | Legendary | Legendary |

## 🚀 Setup Instructions

### 1. Create Turso Account and Database
1. Go to [turso.tech](https://turso.tech) and create a free account
2. Install the Turso CLI:
   ```bash
   # On Windows (using PowerShell)
   iwr -useb https://get.tur.so/install.ps1 | iex
   
   # On macOS/Linux
   curl -sSfL https://get.tur.so/install.sh | bash
   ```
3. Login to Turso:
   ```bash
   turso auth login
   ```
4. Create a new database:
   ```bash
   turso db create times-table-practice
   ```

### 2. Get Database Credentials
1. Get your database URL:
   ```bash
   turso db show --url times-table-practice
   ```
2. Create an authentication token:
   ```bash
   turso db tokens create times-table-practice
   ```

### 3. Configure the Application
1. Open `script.js` in your editor
2. Find the `DB_CONFIG` object at the top of the file
3. Replace the placeholder values with your actual credentials:
   ```javascript
   const DB_CONFIG = {
       url: "libsql://your-actual-database-url.turso.io",
       authToken: "your-actual-auth-token"
   };
   ```

### 4. Test the Application
1. Open `index.html` in your web browser
2. Click "🎯 Start Game" to begin
3. Enter a student name
4. Play through a level and test all features
5. Check the leaderboard and data views

## 🎵 Audio Files Required
Make sure these files are in the same directory as your HTML file:
- `Nyan-Cat.mp3` - Celebration sound for perfect scores
- `error-win.mp3` - Error sound for wrong answers
- `nyan-cat-rainbow.gif` - Animation for perfect scores

## 🎮 How to Play

1. **Start Game**: Click "Start Game" button
2. **Enter Name**: Type student name and click "Let's Go!"
3. **Play Level**: Answer 20 multiplication questions
4. **Lives System**: Lose a heart for each wrong answer
5. **Level Complete**: See stats and advancement options
6. **Progress**: Advance to next level with 80%+ accuracy
7. **Celebration**: Perfect scores trigger Nyan Cat celebration!

## 📈 Data Features

### Student Progress
- View individual student statistics
- Track accuracy improvement over time
- See level progression and achievements
- Monitor session frequency and engagement

### Leaderboard
- Compare students by highest level achieved
- View best accuracy percentages
- Track total sessions played
- Visual ranking with gold/silver/bronze

### Analytics
- Accuracy trends over time
- Questions answered per session
- Level completion rates
- Personal best tracking

## 🔧 Troubleshooting

### Audio Issues
- Ensure audio files are in the correct directory
- Check browser audio permissions
- Verify file formats are supported

### Database Connection
- Verify Turso credentials are correct
- Check database is accessible
- App falls back to localStorage if needed

### Level Progression
- Students need 80% accuracy (16/20) to advance
- Lives reset each level
- Perfect scores trigger special celebration

## 🎯 Educational Benefits

- **Progressive Difficulty**: Builds confidence gradually
- **Immediate Feedback**: Instant correction and encouragement
- **Gamification**: Lives system adds excitement
- **Personal Tracking**: Individual progress monitoring
- **Competition**: Leaderboard motivates improvement
- **Celebration**: Rewards perfect performance

This enhanced system provides a complete learning experience that tracks individual progress while maintaining the fun, engaging gameplay that motivates students to practice their times tables!
