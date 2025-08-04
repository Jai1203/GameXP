// Global variables
let gameActive = true;
let quizQuestions = [];
let currentQuestion = 0;
let quizScore = 0;
let memoryGrid;
let matchedPairs = 0;
let flippedCards = [];
let grid = [];
let score2048 = 0;
let rpsWins = 0;
let rpsLosses = 0;
let rpsDraws = 0;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Load user data
  fetchUserData();
  
  // Initialize games if on games page
  if (window.location.pathname.includes('games.html')) {
    initMemoryGame();
    init2048();
    initTicTacToe();
    initQuiz();
  }
  
  // Setup event listeners
  const winGameBtn = document.getElementById('winGameBtn');
  if (winGameBtn) {
    winGameBtn.addEventListener('click', winGame);
  }
});

// Fetch user data from backend
async function fetchUserData() {
  try {
    const response = await fetch('/api/user');
    const user = await response.json();
    
    // Update username
    const usernameElements = document.querySelectorAll('#username');
    if (usernameElements) {
      usernameElements.forEach(el => {
        el.textContent = user.username;
      });
    }
    
    // Update points displays
    const pointsElements = document.querySelectorAll('#points, #totalPoints, #rewardPoints');
    if (pointsElements) {
      pointsElements.forEach(el => {
        el.textContent = user.points.toLocaleString();
      });
    }
    
    // Update XP progress
    const xpPercent = Math.min(100, (user.xp % 5000) / 50);
    const levelProgress = document.getElementById('levelProgress');
    if (levelProgress) {
      levelProgress.style.width = `${xpPercent}%`;
    }
    
    const currentLevel = document.getElementById('currentLevel');
    if (currentLevel) {
      currentLevel.textContent = user.level;
    }
    
    const currentXP = document.getElementById('currentXP');
    if (currentXP) {
      currentXP.textContent = user.xp.toLocaleString();
    }
    
    const nextLevelXP = document.getElementById('nextLevelXP');
    if (nextLevelXP) {
      nextLevelXP.textContent = '5,000';
    }
    
    const percentComplete = document.getElementById('percentComplete');
    if (percentComplete) {
      percentComplete.textContent = Math.floor(xpPercent);
    }
    
    const xpToNextLevel = document.getElementById('xpToNextLevel');
    if (xpToNextLevel) {
      xpToNextLevel.textContent = (5000 - (user.xp % 5000)).toLocaleString();
    }
    
    const nextLevel = document.getElementById('nextLevel');
    if (nextLevel) {
      nextLevel.textContent = user.level + 1;
    }
    
    // Update challenge progress
    const challenge1Status = document.getElementById('challenge1Status');
    if (challenge1Status) {
      challenge1Status.textContent = user.gamesPlayed;
    }
    
    const challenge2Status = document.getElementById('challenge2Status');
    if (challenge2Status) {
      challenge2Status.textContent = user.gamesWon;
    }
    
    const challenge3Status = document.getElementById('challenge3Status');
    if (challenge3Status) {
      challenge3Status.textContent = user.loginStreak;
    }
    
    const challenge1Progress = document.getElementById('challenge1Progress');
    if (challenge1Progress) {
      challenge1Progress.style.width = `${Math.min(100, (user.gamesPlayed / 5) * 100)}%`;
    }
    
    const challenge2Progress = document.getElementById('challenge2Progress');
    if (challenge2Progress) {
      challenge2Progress.style.width = `${Math.min(100, (user.gamesWon / 3) * 100)}%`;
    }
    
    const challenge3Progress = document.getElementById('challenge3Progress');
    if (challenge3Progress) {
      challenge3Progress.style.width = `${Math.min(100, (user.loginStreak / 7) * 100)}%`;
    }
    
    // Update badges
    const badgesList = document.getElementById('badgesList');
    if (badgesList) {
      badgesList.innerHTML = '';
      user.badges.forEach(badge => {
        const badgeElement = document.createElement('div');
        badgeElement.className = 'badge-item';
        badgeElement.innerHTML = `${badge.name} <span>x${badge.count}</span>`;
        badgesList.appendChild(badgeElement);
      });
    }
    
    // Update rewards
    updateRewardsDisplay();
    updateMyRewardsDisplay();
    
    // Update leaderboard
    updateLeaderboard();
    
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

// Update rewards display
async function updateRewardsDisplay() {
  try {
    const rewardsResponse = await fetch('/api/rewards');
    const rewards = await rewardsResponse.json();
    
    const rewardsList = document.getElementById('rewards-list');
    if (rewardsList) {
      rewardsList.innerHTML = '';
      
      rewards.forEach(reward => {
        const rewardItem = document.createElement('div');
        rewardItem.className = 'reward-item';
        rewardItem.style.marginBottom = '20px';
        rewardItem.style.paddingBottom = '20px';
        rewardItem.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        
        rewardItem.innerHTML = `
          <h3>${reward.name}</h3>
          <p>🎯 ${reward.cost} Points</p>
          <button class="game-button" onclick="redeemReward(${reward.id})">Redeem</button>
        `;
        
        rewardsList.appendChild(rewardItem);
      });
    }
    
    const userResponse = await fetch('/api/user');
    const user = await userResponse.json();
    
    const redeemedRewardsContainer = document.getElementById('redeemed-rewards');
    if (redeemedRewardsContainer) {
      redeemedRewardsContainer.innerHTML = '';
      
      if (user.redeemedRewards.length > 0) {
        user.redeemedRewards.forEach(reward => {
          const div = document.createElement('div');
          div.style.padding = '10px';
          div.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
          div.textContent = `✅ ${reward}`;
          redeemedRewardsContainer.appendChild(div);
        });
      } else {
        redeemedRewardsContainer.innerHTML = '<p>No rewards redeemed yet</p>';
      }
    }
  } catch (error) {
    console.error('Error updating rewards display:', error);
  }
}

// Update my rewards display
async function updateMyRewardsDisplay() {
  try {
    const response = await fetch('/api/user');
    const user = await response.json();
    
    const myRewardsList = document.getElementById('my-rewards-list');
    if (myRewardsList) {
      myRewardsList.innerHTML = '';
      
      if (user.redeemedRewards.length > 0) {
        user.redeemedRewards.forEach(reward => {
          const li = document.createElement('li');
          li.style.padding = '15px';
          li.style.margin = '10px 0';
          li.style.background = 'rgba(255,255,255,0.1)';
          li.style.borderRadius = '8px';
          li.style.display = 'flex';
          li.style.alignItems = 'center';
          li.innerHTML = `<span style="font-size: 1.5rem; margin-right: 15px;">🎁</span> ${reward}`;
          myRewardsList.appendChild(li);
        });
      } else {
        myRewardsList.innerHTML = '<li style="text-align: center; padding: 20px; color: #aaa;">No rewards collected yet</li>';
      }
    }
  } catch (error) {
    console.error('Error updating my rewards display:', error);
  }
}

// Update leaderboard
async function updateLeaderboard() {
  try {
    const response = await fetch('/api/leaderboard');
    const leaderboardData = await response.json();
    
    // Populate global leaderboard
    const globalLeaderboard = document.getElementById('globalLeaderboard');
    if (globalLeaderboard) {
      globalLeaderboard.innerHTML = '';
      
      leaderboardData.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        item.innerHTML = `
          <div class="leaderboard-rank">${index + 1}</div>
          <div class="leaderboard-name">${player.username}</div>
          <div class="leaderboard-points">${player.points.toLocaleString()} pts</div>
        `;
        
        if (player.username === "Player") {
          item.style.background = 'rgba(232, 90, 246, 0.2)';
        }
        
        globalLeaderboard.appendChild(item);
      });
    }
    
    // Populate weekly leaderboard (same as global for demo)
    const weeklyLeaderboard = document.getElementById('weeklyLeaderboard');
    if (weeklyLeaderboard) {
      weeklyLeaderboard.innerHTML = '';
      
      leaderboardData.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        item.innerHTML = `
          <div class="leaderboard-rank">${index + 1}</div>
          <div class="leaderboard-name">${player.username}</div>
          <div class="leaderboard-points">${player.points.toLocaleString()} pts</div>
        `;
        
        if (player.username === "Player") {
          item.style.background = 'rgba(232, 90, 246, 0.2)';
        }
        
        weeklyLeaderboard.appendChild(item);
      });
    }
    
    // Populate friends leaderboard (top 3 for demo)
    const friendsLeaderboard = document.getElementById('friendsLeaderboard');
    if (friendsLeaderboard) {
      friendsLeaderboard.innerHTML = '';
      
      leaderboardData.slice(0, 3).forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        item.innerHTML = `
          <div class="leaderboard-rank">${index + 1}</div>
          <div class="leaderboard-name">${player.username}</div>
          <div class="leaderboard-points">${player.points.toLocaleString()} pts</div>
        `;
        
        if (player.username === "Player") {
          item.style.background = 'rgba(232, 90, 246, 0.2)';
        }
        
        friendsLeaderboard.appendChild(item);
      });
    }
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
}

// Redeem reward
async function redeemReward(rewardId) {
  try {
    const response = await fetch('/api/user/redeem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rewardId })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Reward redeemed successfully!');
      updateRewardsDisplay();
      updateMyRewardsDisplay();
      fetchUserData(); // Refresh user data
    } else {
      alert('Failed to redeem reward: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error redeeming reward:', error);
    alert('Failed to redeem reward');
  }
}

// Add points
async function addPoints(amount) {
  try {
    await fetch('/api/user/points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount })
    });
    
    // Update UI
    fetchUserData();
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = `+${amount} Points!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2000);
    
  } catch (error) {
    console.error('Error adding points:', error);
  }
}

// Record game played
async function recordGamePlayed() {
  try {
    await fetch('/api/game/played', {
      method: 'POST'
    });
  } catch (error) {
    console.error('Error recording game played:', error);
  }
}

// Record game won
async function recordGameWon() {
  try {
    await fetch('/api/game/won', {
      method: 'POST'
    });
  } catch (error) {
    console.error('Error recording game won:', error);
  }
}

// Game management
function toggleGame(id) {
  document.querySelectorAll('.game-section').forEach(g => g.classList.remove('active'));
  if (id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
    gameActive = true;
    
    // Initialize specific games when opened
    if (id === 'memory') initMemoryGame();
    if (id === 'g2048') init2048();
    if (id === 'tictactoe') initTicTacToe();
    if (id === 'quiz') initQuiz();
  }
}

function closeGame() {
  document.querySelectorAll('.game-section').forEach(g => g.classList.remove('active'));
  document.body.style.overflow = 'auto';
}

// Win game function for dashboard
function winGame() {
  addPoints(100);
  recordGameWon();
}

// Memory Flip Game
function initMemoryGame() {
  const memoryGrid = document.getElementById('memoryGrid');
  if (!memoryGrid) return;
  
  memoryGrid.innerHTML = '';
  
  const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
  const cards = [...emojis, ...emojis];
  
  // Shuffle cards
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  
  flippedCards = [];
  matchedPairs = 0;
  
  cards.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.index = index;
    card.dataset.value = emoji;
    card.innerHTML = '<span style="visibility: hidden;">' + emoji + '</span>';
    
    card.addEventListener('click', () => {
      if (!gameActive || flippedCards.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) return;
      
      card.classList.add('flipped');
      card.querySelector('span').style.visibility = 'visible';
      flippedCards.push(card);
      
      if (flippedCards.length === 2) {
        const [card1, card2] = flippedCards;
        
        if (card1.dataset.value === card2.dataset.value) {
          // Match found
          card1.classList.add('matched');
          card2.classList.add('matched');
          flippedCards = [];
          matchedPairs++;
          
          if (matchedPairs === emojis.length) {
            document.getElementById('memoryResult').innerText = 'You Win! +40 points';
            addPoints(40);
            recordGameWon();
            gameActive = false;
          }
        } else {
          // No match
          setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.querySelector('span').style.visibility = 'hidden';
            card2.querySelector('span').style.visibility = 'hidden';
            flippedCards = [];
          }, 1000);
        }
      }
    });
    
    memoryGrid.appendChild(card);
  });
}

// 2048 Game
function init2048() {
  const gameContainer = document.getElementById('game2048');
  if (!gameContainer) return;
  
  gameContainer.innerHTML = '';
  
  // Create grid
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.style.top = (i * 110 + 10) + 'px';
      cell.style.left = (j * 110 + 10) + 'px';
      gameContainer.appendChild(cell);
    }
  }
  
  grid = Array(4).fill().map(() => Array(4).fill(0));
  score2048 = 0;
  
  // Add initial tiles
  addRandomTile2048();
  addRandomTile2048();
  updateView2048();
  
  // Handle keyboard input
  document.addEventListener('keydown', function(e) {
    if (!gameActive) return;
    
    let moved = false;
    
    switch(e.key) {
      case 'ArrowUp':
        moved = moveUp2048();
        break;
      case 'ArrowDown':
        moved = moveDown2048();
        break;
      case 'ArrowLeft':
        moved = moveLeft2048();
        break;
      case 'ArrowRight':
        moved = moveRight2048();
        break;
      default:
        return;
    }
    
    if (moved) {
      addRandomTile2048();
      updateView2048();
      
      if (isGameOver2048()) {
        addPoints(score2048);
        recordGameWon();
        alert(`Game Over! Your score: ${score2048} (+${score2048} points)`);
        gameActive = false;
      }
    }
  });
}

function moveUp2048() {
  let moved = false;
  
  for (let j = 0; j < 4; j++) {
    for (let i = 1; i < 4; i++) {
      if (grid[i][j] !== 0) {
        let k = i;
        while (k > 0 && grid[k-1][j] === 0) {
          grid[k-1][j] = grid[k][j];
          grid[k][j] = 0;
          k--;
          moved = true;
        }
        
        if (k > 0 && grid[k-1][j] === grid[k][j]) {
          grid[k-1][j] *= 2;
          score2048 += grid[k-1][j];
          grid[k][j] = 0;
          moved = true;
        }
      }
    }
  }
  
  return moved;
}

function moveDown2048() {
  let moved = false;
  
  for (let j = 0; j < 4; j++) {
    for (let i = 2; i >= 0; i--) {
      if (grid[i][j] !== 0) {
        let k = i;
        while (k < 3 && grid[k+1][j] === 0) {
          grid[k+1][j] = grid[k][j];
          grid[k][j] = 0;
          k++;
          moved = true;
        }
        
        if (k < 3 && grid[k+1][j] === grid[k][j]) {
          grid[k+1][j] *= 2;
          score2048 += grid[k+1][j];
          grid[k][j] = 0;
          moved = true;
        }
      }
    }
  }
  
  return moved;
}

function moveLeft2048() {
  let moved = false;
  
  for (let i = 0; i < 4; i++) {
    for (let j = 1; j < 4; j++) {
      if (grid[i][j] !== 0) {
        let k = j;
        while (k > 0 && grid[i][k-1] === 0) {
          grid[i][k-1] = grid[i][k];
          grid[i][k] = 0;
          k--;
          moved = true;
        }
        
        if (k > 0 && grid[i][k-1] === grid[i][k]) {
          grid[i][k-1] *= 2;
          score2048 += grid[i][k-1];
          grid[i][k] = 0;
          moved = true;
        }
      }
    }
  }
  
  return moved;
}

function moveRight2048() {
  let moved = false;
  
  for (let i = 0; i < 4; i++) {
    for (let j = 2; j >= 0; j--) {
      if (grid[i][j] !== 0) {
        let k = j;
        while (k < 3 && grid[i][k+1] === 0) {
          grid[i][k+1] = grid[i][k];
          grid[i][k] = 0;
          k++;
          moved = true;
        }
        
        if (k < 3 && grid[i][k+1] === grid[i][k]) {
          grid[i][k+1] *= 2;
          score2048 += grid[i][k+1];
          grid[i][k] = 0;
          moved = true;
        }
      }
    }
  }
  
  return moved;
}

function addRandomTile2048() {
  const emptyCells = [];
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) {
        emptyCells.push({i, j});
      }
    }
  }
  
  if (emptyCells.length > 0) {
    const {i, j} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[i][j] = Math.random() < 0.9 ? 2 : 4;
  }
}

function updateView2048() {
  // Remove all tiles
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach(tile => tile.remove());
  
  // Update score display
  const currentScoreElement = document.getElementById('currentScore');
  if (currentScoreElement) {
    currentScoreElement.textContent = score2048;
  }
  
  // Add current tiles
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] !== 0) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.textContent = grid[i][j];
        tile.style.top = (i * 110 + 10) + 'px';
        tile.style.left = (j * 110 + 10) + 'px';
        
        // Set background color based on value
        const value = grid[i][j];
        const bgColor = `hsl(${Math.log2(value) * 30}, 80%, ${80 - Math.log2(value) * 5}%)`;
        tile.style.background = bgColor;
        
        if (value > 4) {
          tile.style.color = '#f9f6f2';
        }
        
        document.getElementById('game2048').appendChild(tile);
      }
    }
  }
}

function isGameOver2048() {
  // Check if there are empty cells
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) return false;
    }
  }
  
  // Check if there are possible merges
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if ((j < 3 && grid[i][j] === grid[i][j+1]) || 
          (i < 3 && grid[i][j] === grid[i+1][j])) {
        return false;
      }
    }
  }
  
  return true;
}

// Tic Tac Toe Game
function initTicTacToe() {
  const grid = document.getElementById('ticTacGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  let board = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  const resultElement = document.getElementById('ticTacResult');
  if (resultElement) {
    resultElement.textContent = '';
  }
  
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'tic-tac-cell';
    cell.dataset.index = i;
    cell.addEventListener('click', () => makeMove(cell, i));
    grid.appendChild(cell);
  }
}

function makeMove(cell, index) {
  if (!gameActive || cell.textContent !== '') return;
  
  cell.textContent = '❌';
  cell.style.pointerEvents = 'none';
  
  // Check for win or draw
  if (checkWin('❌')) {
    document.getElementById('ticTacResult').textContent = 'You win! +50 points';
    addPoints(50);
    recordGameWon();
    gameActive = false;
    return;
  }
  
  if (isBoardFull()) {
    document.getElementById('ticTacResult').textContent = "It's a draw! +10 points";
    addPoints(10);
    gameActive = false;
    return;
  }
  
  // Computer's move
  setTimeout(() => {
    const emptyCells = [...document.querySelectorAll('.tic-tac-cell')].filter(cell => cell.textContent === '');
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      randomCell.textContent = '⭕';
      randomCell.style.pointerEvents = 'none';
      
      if (checkWin('⭕')) {
        document.getElementById('ticTacResult').textContent = 'Computer wins!';
        gameActive = false;
      } else if (isBoardFull()) {
        document.getElementById('ticTacResult').textContent = "It's a draw! +10 points";
        addPoints(10);
        gameActive = false;
      }
    }
  }, 500);
}

function checkWin(player) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  
  const cells = document.querySelectorAll('.tic-tac-cell');
  return winPatterns.some(pattern => {
    return pattern.every(index => cells[index].textContent === player);
  });
}

function isBoardFull() {
  const cells = document.querySelectorAll('.tic-tac-cell');
  return [...cells].every(cell => cell.textContent !== '');
}

// Rock Paper Scissors Game
function playRPS(choice) {
  if (!gameActive) return;
  
  const choices = ['rock', 'paper', 'scissors'];
  const computerChoice = choices[Math.floor(Math.random() * 3)];
  const resultDisplay = document.getElementById('rpsResult');
  
  resultDisplay.innerHTML = `You chose: ${getEmoji(choice)} | Computer chose: ${getEmoji(computerChoice)}`;
  
  if (choice === computerChoice) {
    resultDisplay.innerHTML += '<br>It\'s a draw!';
    rpsDraws++;
    document.getElementById('rpsDraws').textContent = rpsDraws;
  } else if (
    (choice === 'rock' && computerChoice === 'scissors') ||
    (choice === 'paper' && computerChoice === 'rock') ||
    (choice === 'scissors' && computerChoice === 'paper')
  ) {
    resultDisplay.innerHTML += '<br>You win! +20 points';
    addPoints(20);
    recordGameWon();
    rpsWins++;
    document.getElementById('rpsWins').textContent = rpsWins;
  } else {
    resultDisplay.innerHTML += '<br>Computer wins!';
    rpsLosses++;
    document.getElementById('rpsLosses').textContent = rpsLosses;
  }
}

function getEmoji(choice) {
  switch(choice) {
    case 'rock': return '✊';
    case 'paper': return '✋';
    case 'scissors': return '✌️';
  }
}

// Knowledge Quiz Game
function initQuiz() {
  quizQuestions = [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      answer: 2
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      answer: 1
    },
    {
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
      answer: 3
    },
    {
      question: "Who painted the Mona Lisa?",
      options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
      answer: 2
    },
    {
      question: "What is the chemical symbol for gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      answer: 2
    }
  ];
  
  currentQuestion = 0;
  quizScore = 0;
  showQuizQuestion();
}

function showQuizQuestion() {
  const question = quizQuestions[currentQuestion];
  document.getElementById('quizQuestion').textContent = question.question;
  
  const optionsContainer = document.getElementById('quizOptions');
  optionsContainer.innerHTML = '';
  
  question.options.forEach((option, index) => {
    const optionElement = document.createElement('div');
    optionElement.className = 'quiz-option';
    optionElement.textContent = option;
    optionElement.onclick = () => checkAnswer(index);
    optionsContainer.appendChild(optionElement);
  });
  
  document.getElementById('quizResult').textContent = '';
  document.getElementById('nextQuizBtn').style.display = 'none';
}

function checkAnswer(selectedIndex) {
  const question = quizQuestions[currentQuestion];
  const options = document.querySelectorAll('.quiz-option');
  
  if (selectedIndex === question.answer) {
    options[selectedIndex].style.background = '#4CAF50';
    document.getElementById('quizResult').textContent = 'Correct! +10 points';
    quizScore += 10;
  } else {
    options[selectedIndex].style.background = '#f44336';
    options[question.answer].style.background = '#4CAF50';
    document.getElementById('quizResult').textContent = 'Wrong! The correct answer is: ' + question.options[question.answer];
  }
  
  // Disable options
  options.forEach(opt => {
    opt.style.pointerEvents = 'none';
  });
  
  document.getElementById('nextQuizBtn').style.display = 'block';
}

function nextQuizQuestion() {
  currentQuestion++;
  if (currentQuestion < quizQuestions.length) {
    showQuizQuestion();
  } else {
    // Quiz completed
    addPoints(quizScore);
    recordGameWon();
    document.getElementById('quizResult').textContent = `Quiz completed! Your score: ${quizScore}/50 points`;
    document.getElementById('nextQuizBtn').style.display = 'none';
    gameActive = false;
  }
}

// Spin the Wheel Game
function spinWheel() {
  if (!gameActive) return;
  
  const wheel = document.getElementById('spinWheel');
  const resultDisplay = document.getElementById('wheelResult');
  const spinDegrees = 1080 + Math.floor(Math.random() * 360); // At least 3 full rotations
  
  wheel.style.transform = `rotate(${spinDegrees}deg)`;
  gameActive = false;
  
  setTimeout(() => {
    // Determine prize based on final rotation
    const normalizedRotation = spinDegrees % 360;
    let prize = 0;
    
    if (normalizedRotation < 45) prize = 100;
    else if (normalizedRotation < 90) prize = 200;
    else if (normalizedRotation < 135) prize = 50;
    else if (normalizedRotation < 180) prize = 300;
    else if (normalizedRotation < 225) prize = 150;
    else if (normalizedRotation < 270) prize = 250;
    else if (normalizedRotation < 315) prize = 75;
    else prize = 400;
    
    resultDisplay.textContent = `You won ${prize} points!`;
    addPoints(prize);
    recordGameWon();
  }, 4000);
}

// Show leaderboard
function showLeaderboard(type) {
  document.querySelectorAll('.leaderboard-list').forEach(el => {
    el.style.display = 'none';
  });
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.querySelector(`.tab-btn[onclick="showLeaderboard('${type}')"]`).classList.add('active');
  document.getElementById(`${type}Leaderboard`).style.display = 'block';
}