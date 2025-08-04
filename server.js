const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory database for demo
let users = {
  'player1': {
    id: 'player1',
    username: 'Player',
    points: 8250,
    level: 7,
    xp: 4000,
    redeemedRewards: [],
    gamesPlayed: 0,
    gamesWon: 0,
    loginStreak: 5,
    lastLogin: new Date(),
    badges: [
      { name: 'Gold Gamer', count: 3 },
      { name: 'Speedster', count: 2 },
      { name: 'Brainiac', count: 1 },
      { name: 'Streak Master', count: 1 },
      { name: 'Quiz Whiz', count: 2 },
      { name: 'Arcade Explorer', count: 1 },
      { name: 'Lucky Spinner', count: 1 }
    ]
  }
};

let leaderboard = [
  { username: 'Player', points: 8250, level: 7 },
  { username: 'GameMaster', points: 12500, level: 9 },
  { username: 'ProGamer', points: 11000, level: 8 },
  { username: 'ArcadeKing', points: 9800, level: 8 },
  { username: 'LuckyWinner', points: 8700, level: 7 },
  { username: 'QuizWhiz', points: 7500, level: 7 },
  { username: 'SpeedRunner', points: 6400, level: 6 },
  { username: 'NewPlayer', points: 3200, level: 4 }
];

const rewards = [
  { id: 1, name: "$10 Gift Card", cost: 1000 },
  { id: 2, name: "Premium Game Skin", cost: 500 },
  { id: 3, name: "Exclusive Badge", cost: 300 },
  { id: 4, name: "Double XP Boost", cost: 200 },
  { id: 5, name: "GameXP T-Shirt", cost: 2500 },
  { id: 6, name: "Custom Avatar", cost: 1500 },
  { id: 7, name: "Gold Membership (1 Month)", cost: 3000 }
];

// API Endpoints
app.get('/api/user', (req, res) => {
  res.json(users['player1']);
});

app.post('/api/user/points', (req, res) => {
  const { amount } = req.body;
  users['player1'].points += amount;
  res.json({ success: true, points: users['player1'].points });
});

app.post('/api/user/redeem', (req, res) => {
  const { rewardId } = req.body;
  const reward = rewards.find(r => r.id === rewardId);
  
  if (!reward) {
    return res.status(404).json({ error: "Reward not found" });
  }
  
  if (users['player1'].points < reward.cost) {
    return res.status(400).json({ error: "Not enough points" });
  }
  
  users['player1'].points -= reward.cost;
  users['player1'].redeemedRewards.push(reward.name);
  
  res.json({ 
    success: true, 
    points: users['player1'].points,
    redeemedRewards: users['player1'].redeemedRewards
  });
});

app.get('/api/leaderboard', (req, res) => {
  res.json(leaderboard);
});

app.get('/api/rewards', (req, res) => {
  res.json(rewards);
});

app.post('/api/game/played', (req, res) => {
  users['player1'].gamesPlayed++;
  res.json({ success: true });
});

app.post('/api/game/won', (req, res) => {
  users['player1'].gamesWon++;
  res.json({ success: true });
});

// Serve HTML files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});