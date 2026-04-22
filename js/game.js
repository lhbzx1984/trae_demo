class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;

        this.snake = new Snake(this.canvasWidth, this.canvasHeight, this.gridSize);
        this.food = new Food(this.canvasWidth, this.canvasHeight, this.gridSize);

        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.gameLoop = null;

        this.soundEnabled = true;
        this.eatSound = document.getElementById('eatSound');
        this.gameOverSound = document.getElementById('gameOverSound');

        this.initEventListeners();
        this.initSettings();
        this.draw();
    }

    initEventListeners() {
        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('restartGameBtn').addEventListener('click', () => this.restartGame());

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Settings
        document.getElementById('difficulty').addEventListener('change', (e) => this.changeDifficulty(e.target.value));
        document.getElementById('speed').addEventListener('input', (e) => this.changeSpeed(e.target.value));
        document.getElementById('grid').addEventListener('change', (e) => this.toggleGrid(e.target.checked));
        document.getElementById('sound').addEventListener('change', (e) => this.toggleSound(e.target.checked));
    }

    initSettings() {
        this.difficulty = 'medium';
        this.speed = 5;
        this.showGrid = true;
        this.updateSpeedDisplay();
    }

    handleKeyPress(e) {
        if (this.gameState === 'playing') {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.snake.changeDirection('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.snake.changeDirection('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.snake.changeDirection('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.snake.changeDirection('right');
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        } else if (this.gameState === 'paused') {
            if (e.key === ' ') {
                e.preventDefault();
                this.togglePause();
            }
        } else if (this.gameState === 'menu' || this.gameState === 'gameover') {
            if (e.key === 'Enter') {
                this.startGame();
            }
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.snake.reset();
        this.food.generate();
        this.updateUI();
        this.gameLoop = setInterval(() => this.update(), this.snake.getCurrentSpeed());

        // Update button visibility
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'block';
        document.getElementById('restartBtn').style.display = 'block';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('pauseOverlay').style.display = 'none';
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            clearInterval(this.gameLoop);
            document.getElementById('pauseOverlay').style.display = 'flex';
            document.getElementById('pauseBtn').textContent = '继续游戏';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameLoop = setInterval(() => this.update(), this.snake.getCurrentSpeed());
            document.getElementById('pauseOverlay').style.display = 'none';
            document.getElementById('pauseBtn').textContent = '暂停游戏';
        }
    }

    endGame() {
        this.gameState = 'gameover';
        clearInterval(this.gameLoop);

        if (this.soundEnabled) {
            this.gameOverSound.currentTime = 0;
            this.gameOverSound.play();
        }

        document.getElementById('finalScore').textContent = this.snake.getScore();
        document.getElementById('gameOver').style.display = 'flex';
        document.getElementById('pauseBtn').style.display = 'none';
        document.getElementById('restartBtn').style.display = 'none';
        document.getElementById('startBtn').style.display = 'block';
    }

    restartGame() {
        this.startGame();
    }

    update() {
        // Update snake position
        const newHead = this.snake.update();

        // Check wall collision
        if (this.snake.checkWallCollision() || this.snake.checkSelfCollision()) {
            this.endGame();
            return;
        }

        // Check food collision
        if (this.food.checkCollision(newHead.x, newHead.y)) {
            this.snake.grow();

            if (this.soundEnabled) {
                this.eatSound.currentTime = 0;
                this.eatSound.play();
            }

            // Generate new food, but make sure it doesn't appear on the snake
            let validPosition = false;
            while (!validPosition) {
                this.food.generate();
                validPosition = !this.snake.body.some(segment =>
                    segment.x === this.food.x && segment.y === this.food.y
                );
            }

            // Remove tail since we grew
            this.snake.body.pop();
        } else {
            // Remove tail for normal movement
            this.snake.body.pop();
        }

        this.updateUI();
        this.draw();
    }

    updateUI() {
        document.getElementById('score').textContent = this.snake.getScore();
        document.getElementById('level').textContent = this.snake.getLevel();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1A1A2E';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw snake and food
        this.snake.draw(this.ctx, this.showGrid);
        this.food.draw(this.ctx);

        // Draw game state messages
        if (this.gameState === 'menu') {
            this.drawMessage('按回车键开始游戏', 'Press Enter to Start');
        }
    }

    drawMessage(title, subtitle) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.canvasWidth / 2, this.canvasHeight / 2 - 20);

        this.ctx.font = '20px Arial';
        this.ctx.fillText(subtitle, this.canvasWidth / 2, this.canvasHeight / 2 + 20);
    }

    changeDifficulty(difficulty) {
        this.difficulty = difficulty;
        let baseSpeed;

        switch (difficulty) {
            case 'easy':
                baseSpeed = 3;
                break;
            case 'medium':
                baseSpeed = 5;
                break;
            case 'hard':
                baseSpeed = 7;
                break;
        }

        this.changeSpeed(baseSpeed);
        document.getElementById('speed').value = baseSpeed;
        this.updateSpeedDisplay();
    }

    changeSpeed(speed) {
        this.speed = parseInt(speed);
        this.updateSpeedDisplay();

        if (this.gameState === 'playing') {
            clearInterval(this.gameLoop);
            this.snake.speed = Math.max(50, 150 - (this.speed * 10));
            this.gameLoop = setInterval(() => this.update(), this.snake.getCurrentSpeed());
        }
    }

    updateSpeedDisplay() {
        document.getElementById('speedValue').textContent = this.speed;
    }

    toggleGrid(show) {
        this.showGrid = show;
    }

    toggleSound(enabled) {
        this.soundEnabled = enabled;
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new Game();
});