document.addEventListener("DOMContentLoaded", () => {
  // Create background particles
  const bgParticles = document.getElementById("bgParticles");
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 6 + "s";
    particle.style.animationDuration = Math.random() * 4 + 4 + "s";
    bgParticles.appendChild(particle);
  }

  // Game elements
  const gameArea = document.getElementById("gameArea");
  const scoreValue = document.querySelector(".score-value");
  const highScoreValue = document.querySelector(".high-score-value");
  const restartBtn = document.getElementById("restartBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const gameMessage = document.getElementById("gameMessage");
  const finalScore = document.getElementById("finalScore");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const timeRemaining = document.getElementById("timeRemaining");

  // Sound effects
  const smashSound = new Audio("sounds/smash.mp3");
  const gameOverSound = new Audio("sounds/gameover.mp3");
  const buttonSound = new Audio("sounds/button.mp3");

  // Game state
  let score = 0;
  let highScore = parseInt(localStorage.getItem("antSmasherHighScore")) || 0;
  let gameActive = false;
  let gamePaused = false;
  let ants = [];
  let gameTimer;
  let timeLeft = 60;
  let spawnInterval;

  // Initialize game
  function initGame() {
    score = 0;
    timeLeft = 60;
    gameActive = true;
    gamePaused = false;

    scoreValue.textContent = score;
    highScoreValue.textContent = highScore;
    timeRemaining.textContent = timeLeft + "s";
    timeRemaining.classList.remove("warning");

    gameMessage.classList.remove("game-over");
    pauseBtn.textContent = "⏸️ Pause";

    // Clear existing ants
    ants.forEach((ant) => ant.remove());
    ants = [];

    // Start game timer
    startGameTimer();

    // Start spawning ants
    spawnAnts();
  }

  function startGameTimer() {
    gameTimer = setInterval(() => {
      if (!gamePaused && gameActive) {
        timeLeft--;
        timeRemaining.textContent = timeLeft + "s";

        if (timeLeft <= 10) {
          timeRemaining.classList.add("warning");
        }

        if (timeLeft <= 0) {
          endGame();
        }
      }
    }, 1000);
  }

  // Spawn ants at random intervals
  function spawnAnts() {
    if (!gameActive || gamePaused) {
      if (gameActive) {
        setTimeout(spawnAnts, 100);
      }
      return;
    }

    // Create new ant
    createAnt();

    // Schedule next ant (gets faster as score increases)
    const baseSpawn = 1200 - Math.min(score * 5, 800);
    const nextSpawn = Math.random() * baseSpawn + 300;
    setTimeout(spawnAnts, nextSpawn);
  }

  // Create a single ant
  function createAnt() {
    if (!gameActive || gamePaused) return;

    const ant = document.createElement("div");
    ant.className = "ant";

    // Ant structure
    ant.innerHTML = `
                    <div class="ant-head">
                        <div class="ant-eye"></div>
                        <div class="ant-antenna antenna-left"></div>
                        <div class="ant-antenna antenna-right"></div>
                    </div>
                    <div class="ant-body"></div>
                    <div class="ant-legs">
                        <div class="leg leg-1"></div>
                        <div class="leg leg-2"></div>
                        <div class="leg leg-3"></div>
                        <div class="leg leg-4"></div>
                        <div class="leg leg-5"></div>
                        <div class="leg leg-6"></div>
                    </div>
                `;

    // Random position
    const gameRect = gameArea.getBoundingClientRect();
    const maxX = gameRect.width - 55;
    const maxY = gameRect.height - 120;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY + 50;

    ant.style.left = `${x}px`;
    ant.style.top = `${y}px`;

    // Add to game area
    gameArea.appendChild(ant);
    ants.push(ant);

    // Click event to smash ant
    ant.addEventListener("click", (e) => {
      e.stopPropagation();
      smashAnt(ant, e.clientX, e.clientY);
    });

    // Remove ant after some time
    setTimeout(() => {
      if (ant.parentNode && !ant.classList.contains("smashed")) {
        ant.style.opacity = "0";
        setTimeout(() => {
          if (ant.parentNode) {
            ant.remove();
            ants = ants.filter((a) => a !== ant);
          }
        }, 300);
      }
    }, 2500 + Math.random() * 1500);
  }

  // Smash an ant
  function smashAnt(ant, x, y) {
    if (!gameActive || gamePaused || ant.classList.contains("smashed")) return;

    // Play smash sound
    smashSound.currentTime = 0;
    smashSound.play();

    score += 10;
    scoreValue.textContent = score;
    scoreValue.classList.add("updated");
    setTimeout(() => scoreValue.classList.remove("updated"), 300);

    // Create score popup
    const popup = document.createElement("div");
    popup.className = "score-popup";
    popup.textContent = "+10";
    popup.style.left = x - gameArea.offsetLeft + "px";
    popup.style.top = y - gameArea.offsetTop + "px";
    gameArea.appendChild(popup);

    // Remove popup after animation
    setTimeout(() => popup.remove(), 1000);

    // Add smashed class
    ant.classList.add("smashed");

    // Remove ant after animation
    setTimeout(() => {
      if (ant.parentNode) {
        ant.remove();
        ants = ants.filter((a) => a !== ant);
      }
    }, 400);
  }

  // Pause/Resume game
  function togglePause() {
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? "▶️ Resume" : "⏸️ Pause";

    if (gamePaused) {
      ants.forEach((ant) => (ant.style.animationPlayState = "paused"));
    } else {
      ants.forEach((ant) => (ant.style.animationPlayState = "running"));
    }
  }

  // End the game
  function endGame() {
    gameActive = false;
    clearInterval(gameTimer);

    // Play game over sound
    gameOverSound.currentTime = 0;
    gameOverSound.play();

    // Remove all ants
    ants.forEach((ant) => ant.remove());
    ants = [];

    // Show game over message
    finalScore.textContent = score;
    gameMessage.classList.add("game-over");

    // Update high score
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("antSmasherHighScore", highScore);
      highScoreValue.textContent = highScore;
      highScoreValue.classList.add("updated");
      setTimeout(() => highScoreValue.classList.remove("updated"), 1000);
    }
  }

  // Event listeners
  restartBtn.addEventListener("click", () => {
    buttonSound.currentTime = 0;
    buttonSound.play();
    clearInterval(gameTimer);
    gameMessage.classList.remove("game-over");
    initGame();
  });

  pauseBtn.addEventListener("click", () => {
    buttonSound.currentTime = 0;
    buttonSound.play();
    togglePause();
  });

  playAgainBtn.addEventListener("click", () => {
    buttonSound.currentTime = 0;
    buttonSound.play();
    clearInterval(gameTimer);
    gameMessage.classList.remove("game-over");
    initGame();
  });

  // Initialize high score display
  highScoreValue.textContent = highScore;

  // Start the game
  initGame();
});
