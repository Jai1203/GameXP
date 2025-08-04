// Global variables
    let points = localStorage.getItem('gamexp_points') ? parseInt(localStorage.getItem('gamexp_points')) : 8250;
    let gameActive = true;
    let redeemedRewards = JSON.parse(localStorage.getItem('redeemedRewards')) || [];
    let gamesPlayed = localStorage.getItem('gamesPlayed') ? parseInt(localStorage.getItem('gamesPlayed')) : 0;
    let gamesWon = localStorage.getItem('gamesWon') ? parseInt(localStorage.getItem('gamesWon')) : 0;
    let loginStreak = localStorage.getItem('loginStreak') ? parseInt(localStorage.getItem('loginStreak')) : 5;
    let lastLogin = localStorage.getItem('lastLogin') ? new Date(localStorage.getItem('lastLogin')) : null;
    let bestReaction = localStorage.getItem('bestReaction') ? parseInt(localStorage.getItem('bestReaction')) : 0;
    let mathScore = 0;
    let mathQuestions = [];
    let currentMathQuestion = 0;
    
    // Initialize the app
    document.addEventListener('DOMContentLoaded', () => {
      updatePointsDisplay();
      updateRewardsDisplay();
      updateMyRewardsDisplay();
      initMemoryGame();
      init2048();
      initTicTacToe();
      initQuiz();
      initMathQuiz();
      
      // Navigation
      document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const target = this.getAttribute('href').substring(1);
          showSection(target);
          
          if (target === 'leaderboard') {
            updateLeaderboard();
          }
        });
      });
      
      // Win game button
      document.getElementById('winGameBtn').addEventListener('click', winGame);
      
      // Submit math answer
      document.getElementById('submitMathBtn').addEventListener('click', checkMathAnswer);
      document.getElementById('mathAnswer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          checkMathAnswer();
        }
      });
      
      // Reaction timer
      document.getElementById('startReactionBtn').addEventListener('click', startReactionTest);
      document.getElementById('reactionBox').addEventListener('click', reactionBoxClicked);
      
      // Check login streak
      checkLoginStreak();
    });
    
    // Check login streak
    function checkLoginStreak() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (!lastLogin) {
        // First login
        loginStreak = 1;
      } else {
        const diffDays = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Consecutive login
          loginStreak++;
        } else if (diffDays > 1) {
          // Broken streak
          loginStreak = 1;
        }
      }
      
      // Save login data
      localStorage.setItem('loginStreak', loginStreak);
      localStorage.setItem('lastLogin', today);
      
      // Update challenge progress
      updateChallengeProgress();
    }
    
    // Show specific section
    function showSection(sectionId) {
      document.querySelectorAll('.container').forEach(section => {
        section.style.display = 'none';
      });
      
      document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
      });
      
      document.querySelector(`a[href="#${sectionId}"]`).classList.add('active');
      document.getElementById(sectionId).style.display = 'block';
    }
    
    // Points system
    function addPoints(amount) {
      points += amount;
      localStorage.setItem('gamexp_points', points);
      updatePointsDisplay();
      
      // Show notification
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.textContent = `+${amount} Points!`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 2000);
      
      // Update games played
      gamesPlayed++;
      localStorage.setItem('gamesPlayed', gamesPlayed);
      
      // Update challenge progress
      updateChallengeProgress();
    }
    
    function updatePointsDisplay() {
      // Dashboard points
      document.getElementById('totalPoints').textContent = points.toLocaleString();
      
      // Games page points
      if (document.getElementById('points')) {
        document.getElementById('points').textContent = points.toLocaleString();
      }
      
      // Rewards page points
      if (document.getElementById('rewardPoints')) {
        document.getElementById('rewardPoints').textContent = points.toLocaleString();
      }
      
      // Update XP progress
      const xpPercent = Math.min(100, (points % 5000) / 50);
      document.getElementById('levelProgress').style.width = `${xpPercent}%`;
      document.getElementById('currentXP').textContent = (points % 5000).toLocaleString();
      document.getElementById('percentComplete').textContent = Math.floor(xpPercent);
      document.getElementById('xpToNextLevel').textContent = (5000 - (points % 5000)).toLocaleString();
    }
    
    // Update challenge progress
    function updateChallengeProgress() {
      // Challenge 1: Play 5 games
      const challenge1Progress = Math.min(100, (gamesPlayed / 5) * 100);
      document.getElementById('challenge1Progress').style.width = `${challenge1Progress}%`;
      
      // Challenge 2: Win 3 games
      const challenge2Progress = Math.min(100, (gamesWon / 3) * 100);
      document.getElementById('challenge2Progress').style.width = `${challenge2Progress}%`;
      
      // Challenge 3: 7-day login streak
      const challenge3Progress = Math.min(100, (loginStreak / 7) * 100);
      document.getElementById('challenge3Progress').style.width = `${challenge3Progress}%`;
    }
    
    // Rewards system
    function redeemReward(rewardName, cost) {
      if (points >= cost) {
        points -= cost;
        localStorage.setItem('gamexp_points', points);
        
        redeemedRewards.push(rewardName);
        localStorage.setItem('redeemedRewards', JSON.stringify(redeemedRewards));
        
        updatePointsDisplay();
        updateRewardsDisplay();
        updateMyRewardsDisplay();
        
        alert(`🎉 Success! You redeemed: ${rewardName}`);
      } else {
        alert("You don't have enough points for this reward!");
      }
    }
    
    function updateRewardsDisplay() {
      if (document.getElementById('redeemed-rewards')) {
        const container = document.getElementById('redeemed-rewards');
        container.innerHTML = '';
        
        if (redeemedRewards.length > 0) {
          redeemedRewards.forEach(reward => {
            const div = document.createElement('div');
            div.style.padding = '10px';
            div.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            div.textContent = `✅ ${reward}`;
            container.appendChild(div);
          });
        } else {
          container.innerHTML = '<p>No rewards redeemed yet</p>';
        }
      }
    }
    
    function updateMyRewardsDisplay() {
      if (document.getElementById('my-rewards-list')) {
        const list = document.getElementById('my-rewards-list');
        list.innerHTML = '';
        
        if (redeemedRewards.length > 0) {
          redeemedRewards.forEach(reward => {
            const li = document.createElement('li');
            li.style.padding = '15px';
            li.style.margin = '10px 0';
            li.style.background = 'rgba(255,255,255,0.1)';
            li.style.borderRadius = '8px';
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.innerHTML = `<span style="font-size: 1.5rem; margin-right: 15px;">🎁</span> ${reward}`;
            list.appendChild(li);
          });
        } else {
          list.innerHTML = '<li style="text-align: center; padding: 20px; color: #aaa;">No rewards collected yet</li>';
        }
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
        if (id === 'math') initMathQuiz();
      }
    }
    
    function closeGame() {
      toggleGame(null);
      document.body.style.overflow = 'auto';
    }
    
    // Win game function for dashboard
    function winGame() {
      addPoints(100);
      gamesWon++;
      localStorage.setItem('gamesWon', gamesWon);
      updateChallengeProgress();
    }
    
    // Memory Flip Game
    function initMemoryGame() {
      const memoryGrid = document.getElementById('memoryGrid');
      memoryGrid.innerHTML = '';
      
      const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
      const cards = [...emojis, ...emojis];
      
      // Shuffle cards
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }
      
      let flippedCards = [];
      let matchedPairs = 0;
      
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
                gamesWon++;
                localStorage.setItem('gamesWon', gamesWon);
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
      
      let grid = Array(4).fill().map(() => Array(4).fill(0));
      let score = 0;
      
      // Add initial tiles
      addRandomTile();
      addRandomTile();
      updateView();
      
      // Handle keyboard input
      document.addEventListener('keydown', function(e) {
        if (!gameActive) return;
        
        let moved = false;
        
        switch(e.key) {
          case 'ArrowUp':
            moved = moveUp();
            break;
          case 'ArrowDown':
            moved = moveDown();
            break;
          case 'ArrowLeft':
            moved = moveLeft();
            break;
          case 'ArrowRight':
            moved = moveRight();
            break;
          default:
            return;
        }
        
        if (moved) {
          addRandomTile();
          updateView();
          
          if (isGameOver()) {
            addPoints(score);
            gamesWon++;
            localStorage.setItem('gamesWon', gamesWon);
            alert(`Game Over! Your score: ${score} (+${score} points)`);
            gameActive = false;
          }
        }
      });
      
      function moveUp() {
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
                score += grid[k-1][j];
                grid[k][j] = 0;
                moved = true;
              }
            }
          }
        }
        
        return moved;
      }
      
      function moveDown() {
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
                score += grid[k+1][j];
                grid[k][j] = 0;
                moved = true;
              }
            }
          }
        }
        
        return moved;
      }
      
      function moveLeft() {
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
                score += grid[i][k-1];
                grid[i][k] = 0;
                moved = true;
              }
            }
          }
        }
        
        return moved;
      }
      
      function moveRight() {
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
                score += grid[i][k+1];
                grid[i][k] = 0;
                moved = true;
              }
            }
          }
        }
        
        return moved;
      }
      
      function addRandomTile() {
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
      
      function updateView() {
        // Remove all tiles
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());
        
        // Update score display
        document.getElementById('currentScore').textContent = score;
        
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
              
              gameContainer.appendChild(tile);
            }
          }
        }
      }
      
      function isGameOver() {
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
    }
    
    // Mini Cricket Game
    function playCricket() {
      if (!gameActive) return;
      
      const ball = document.getElementById('cricketBall');
      const runsDisplay = document.getElementById('cricketRuns');
      const resultDisplay = document.getElementById('cricketResult');
      
      // Animate the ball
      ball.style.transition = 'all 0.8s ease-in-out';
      ball.style.top = '60%';
      
      setTimeout(() => {
        // Random outcome
        const outcomes = [0, 1, 2, 4, 6, 'out'];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        
        if (outcome === 'out') {
          resultDisplay.textContent = 'OUT! Game Over.';
          resultDisplay.style.color = '#f44336';
          addPoints(parseInt(runsDisplay.textContent));
          gamesWon++;
          localStorage.setItem('gamesWon', gamesWon);
          gameActive = false;
        } else {
          resultDisplay.textContent = `You scored ${outcome} runs!`;
          resultDisplay.style.color = '#4caf50';
          runsDisplay.textContent = parseInt(runsDisplay.textContent) + outcome;
          
          // Reset ball position
          setTimeout(() => {
            ball.style.transition = 'none';
            ball.style.top = '40%';
            resultDisplay.textContent = '';
          }, 1500);
        }
      }, 800);
    }
    
    // Tic Tac Toe Game
    function initTicTacToe() {
      const grid = document.getElementById('ticTacGrid');
      grid.innerHTML = '';
      
      let board = ['', '', '', '', '', '', '', '', ''];
      let currentPlayer = 'X';
      gameActive = true;
      document.getElementById('ticTacResult').textContent = '';
      
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
        gamesWon++;
        localStorage.setItem('gamesWon', gamesWon);
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
        document.getElementById('rpsDraws').textContent = parseInt(document.getElementById('rpsDraws').textContent) + 1;
      } else if (
        (choice === 'rock' && computerChoice === 'scissors') ||
        (choice === 'paper' && computerChoice === 'rock') ||
        (choice === 'scissors' && computerChoice === 'paper')
      ) {
        resultDisplay.innerHTML += '<br>You win! +20 points';
        addPoints(20);
        gamesWon++;
        localStorage.setItem('gamesWon', gamesWon);
        document.getElementById('rpsWins').textContent = parseInt(document.getElementById('rpsWins').textContent) + 1;
      } else {
        resultDisplay.innerHTML += '<br>Computer wins!';
        document.getElementById('rpsLosses').textContent = parseInt(document.getElementById('rpsLosses').textContent) + 1;
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
      score = 0;
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
        score += 10;
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
        addPoints(score);
        gamesWon++;
        localStorage.setItem('gamesWon', gamesWon);
        document.getElementById('quizResult').textContent = `Quiz completed! Your score: ${score}/50 points`;
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
        gamesWon++;
        localStorage.setItem('gamesWon', gamesWon);
      }, 4000);
    }
    
    // Math Quiz Game
    function initMathQuiz() {
      mathScore = 0;
      currentMathQuestion = 0;
      document.getElementById('mathScore').textContent = mathScore;
      document.getElementById('mathResult').textContent = '';
      document.getElementById('mathAnswer').value = '';
      generateMathQuestion();
    }
    
    function generateMathQuestion() {
      const operations = ['+', '-', '*'];
      const op = operations[Math.floor(Math.random() * operations.length)];
      let num1, num2, answer;
      
      switch(op) {
        case '+':
          num1 = Math.floor(Math.random() * 50) + 1;
          num2 = Math.floor(Math.random() * 50) + 1;
          answer = num1 + num2;
          break;
        case '-':
          num1 = Math.floor(Math.random() * 50) + 1;
          num2 = Math.floor(Math.random() * num1) + 1;
          answer = num1 - num2;
          break;
        case '*':
          num1 = Math.floor(Math.random() * 12) + 1;
          num2 = Math.floor(Math.random() * 12) + 1;
          answer = num1 * num2;
          break;
      }
      
      document.getElementById('mathQuestion').textContent = `${num1} ${op} ${num2} = ?`;
      document.getElementById('mathAnswer').dataset.answer = answer;
      document.getElementById('mathAnswer').value = '';
      document.getElementById('mathResult').textContent = '';
      document.getElementById('mathAnswer').focus();
    }
    
    function checkMathAnswer() {
      if (!gameActive) return;
      
      const answerInput = document.getElementById('mathAnswer');
      const userAnswer = parseInt(answerInput.value);
      const correctAnswer = parseInt(answerInput.dataset.answer);
      const resultDisplay = document.getElementById('mathResult');
      
      if (isNaN(userAnswer)) {
        resultDisplay.textContent = 'Please enter a valid number';
        return;
      }
      
      if (userAnswer === correctAnswer) {
        resultDisplay.textContent = 'Correct! +10 points';
        resultDisplay.style.color = '#4CAF50';
        mathScore += 10;
        document.getElementById('mathScore').textContent = mathScore;
      } else {
        resultDisplay.textContent = `Wrong! The correct answer is ${correctAnswer}`;
        resultDisplay.style.color = '#f44336';
      }
      
      currentMathQuestion++;
      
      if (currentMathQuestion < 5) {
        setTimeout(generateMathQuestion, 1500);
      } else {
        setTimeout(() => {
          resultDisplay.textContent = `Quiz completed! Your score: ${mathScore} points`;
          addPoints(mathScore);
          gamesWon++;
          localStorage.setItem('gamesWon', gamesWon);
          gameActive = false;
        }, 1500);
      }
    }
    
    // Reaction Timer Game
    function startReactionTest() {
      if (!gameActive) return;
      
      const reactionBox = document.getElementById('reactionBox');
      const startBtn = document.getElementById('startReactionBtn');
      const resultDisplay = document.getElementById('reactionResult');
      
      startBtn.style.display = 'none';
      reactionBox.textContent = 'Wait...';
      reactionBox.className = 'reaction-box waiting';
      resultDisplay.textContent = '';
      
      // Random delay between 2 and 5 seconds
      const delay = 2000 + Math.floor(Math.random() * 3000);
      
      setTimeout(() => {
        reactionBox.textContent = 'CLICK NOW!';
        reactionBox.className = 'reaction-box ready';
        startTime = new Date();
      }, delay);
    }
    
    function reactionBoxClicked() {
      if (!gameActive || !startTime) return;
      
      const reactionBox = document.getElementById('reactionBox');
      const resultDisplay = document.getElementById('reactionResult');
      const startBtn = document.getElementById('startReactionBtn');
      
      if (reactionBox.className.includes('ready')) {
        const endTime = new Date();
        const reactionTime = endTime - startTime;
        
        resultDisplay.textContent = `${reactionTime} ms`;
        
        // Award points based on reaction time
        let pointsEarned = Math.max(10, 100 - Math.floor(reactionTime / 10));
        addPoints(pointsEarned);
        
        // Update best reaction time
        if (reactionTime < bestReaction || bestReaction === 0) {
          bestReaction = reactionTime;
          localStorage.setItem('bestReaction', bestReaction);
          document.getElementById('bestReaction').textContent = bestReaction;
        }
        
        // Reset for next try
        reactionBox.textContent = 'Click Start to play again';
        reactionBox.className = 'reaction-box';
        startBtn.style.display = 'block';
        startTime = null;
      }
    }
    
    // Leaderboard
    function updateLeaderboard() {
      const leaderboardData = [
        { name: "Player", points: points },
        { name: "GameMaster", points: 12500 },
        { name: "ProGamer", points: 11000 },
        { name: "ArcadeKing", points: 9800 },
        { name: "LuckyWinner", points: 8700 },
        { name: "QuizWhiz", points: 7500 },
        { name: "SpeedRunner", points: 6400 },
        { name: "NewPlayer", points: 3200 }
      ];
      
      // Sort by points
      leaderboardData.sort((a, b) => b.points - a.points);
      
      // Populate leaderboards
      populateLeaderboard('globalLeaderboard', leaderboardData);
      populateLeaderboard('weeklyLeaderboard', leaderboardData.map(p => ({...p, points: Math.floor(p.points * 0.7)})));
      
      // Friends leaderboard (just top 3 from global)
      populateLeaderboard('friendsLeaderboard', leaderboardData.slice(0, 3));
    }
    
    function populateLeaderboard(elementId, data) {
      const container = document.getElementById(elementId);
      container.innerHTML = '';
      
      data.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        item.innerHTML = `
          <div class="leaderboard-rank">${index + 1}</div>
          <div class="leaderboard-name">${player.name}</div>
          <div class="leaderboard-points">${player.points.toLocaleString()} pts</div>
        `;
        
        // Highlight current player
        if (player.name === "Player") {
          item.style.background = 'rgba(232, 90, 246, 0.2)';
        }
        
        container.appendChild(item);
      });
    }
    
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