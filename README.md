# 🌟 Math Practice Game

A comprehensive math practice game designed for 4th-5th grade students featuring progressive difficulty levels and mixed operations.

## 🎮 Features

- **10 Progressive Levels**: From easy multiplication to master-level mixed operations
- **Mixed Operations**: Multiplication (×), Division (÷), Addition (+), Subtraction (-)
- **Lives System**: 4 hearts with visual indicators
- **Student Tracking**: Individual progress tracking by name
- **Sound Effects**: Audio feedback for correct/incorrect answers
- **Nyan Cat Celebration**: Special animation for perfect scores
- **Leaderboard**: Compare students by highest level achieved
- **Analytics**: Detailed progress tracking with charts
- **Database Integration**: Turso database for persistent data storage

## 🎯 Level Progression

| Level | Operations | Range | Description |
|-------|------------|-------|-------------|
| 1 | × only | 0-5 | Easy Multiplication |
| 2 | × only | 0-7 | Easy+ Multiplication |
| 3 | ×, + | 0-10 | Mixed: × and + |
| 4 | ×, +, - | 2-12 | Mixed: ×, +, - |
| 5 | ×, +, - | 5-12 | Mixed: ×, +, - |
| 6 | ×, ÷ | 7-12 | Mixed: × and ÷ |
| 7 | ×, ÷, + | 9-12 | Mixed: ×, ÷, + |
| 8 | ×, ÷, - | 10-12 | Mixed: ×, ÷, - |
| 9 | All 4 | 11-12 | All Operations |
| 10 | All 4 | 12 only | Master All Operations |

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jpetree331/MathGame.git
   cd MathGame
   ```

2. **Set up Turso Database**:
   - Create account at [turso.tech](https://turso.tech)
   - Install Turso CLI
   - Create database: `turso db create math-game`
   - Get credentials: `turso db show --url math-game`
   - Create token: `turso db tokens create math-game`

3. **Configure Database**:
   - Update `script.js` with your Turso credentials:
   ```javascript
   const DB_CONFIG = {
       url: "libsql://your-database-url.turso.io",
       authToken: "your-auth-token"
   };
   ```

4. **Open `index.html`** in your browser and start playing!

## 📁 File Structure

```
MathGame/
├── index.html          # Main HTML file
├── script.js           # Game logic and database integration
├── styles.css          # Styling and animations
├── Nyan-Cat.mp3        # Celebration sound
├── error-win.mp3        # Error sound
├── nyan-cat-rainbow.gif # Celebration animation
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## 🎵 Audio Files

Make sure these files are in the same directory as `index.html`:
- `Nyan-Cat.mp3` - Celebration sound for perfect scores
- `error-win.mp3` - Error sound for wrong answers
- `nyan-cat-rainbow.gif` - Animation for perfect scores

## 🎮 How to Play

1. **Start Game**: Click "Start Game" button
2. **Enter Name**: Type student name and click "Let's Go!"
3. **Play Level**: Answer 20 math questions
4. **Lives System**: Lose a heart for each wrong answer
5. **Level Complete**: See stats and advancement options
6. **Progress**: Advance to next level with 80%+ accuracy
7. **Celebration**: Perfect scores trigger Nyan Cat celebration!

## 📊 Data Features

- **Student Progress**: Individual statistics and charts
- **Accuracy Tracking**: Monitor improvement over time
- **Level Progression**: Track advancement through levels
- **Leaderboard**: Compare students by achievements
- **Session History**: Detailed breakdown of all attempts

## 🔧 Technical Details

- **Frontend**: Pure HTML, CSS, JavaScript
- **Database**: Turso (libSQL)
- **Charts**: Chart.js for data visualization
- **Audio**: HTML5 Audio API
- **Storage**: Fallback to localStorage for offline mode

## 🚀 Deployment

### Frontend (Netlify)
1. Connect GitHub repository to Netlify
2. Deploy from main branch
3. No build process needed - static files

### Backend (Railway)
1. Set up Turso database
2. Configure environment variables
3. Database handles all backend functionality

## 📈 Educational Benefits

- **Progressive Difficulty**: Builds confidence gradually
- **Immediate Feedback**: Instant correction and encouragement
- **Gamification**: Lives system adds excitement
- **Personal Tracking**: Individual progress monitoring
- **Competition**: Leaderboard motivates improvement
- **Celebration**: Rewards perfect performance

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.
