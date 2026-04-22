class Food {
    constructor(canvasWidth, canvasHeight, gridSize) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.gridSize = gridSize;
        this.x = 0;
        this.y = 0;
        this.color = '#FF6B6B';
        this.size = gridSize;
        this.generate();
    }

    generate() {
        const maxX = Math.floor(this.canvasWidth / this.gridSize) - 1;
        const maxY = Math.floor(this.canvasHeight / this.gridSize) - 1;

        this.x = Math.floor(Math.random() * maxX) * this.gridSize;
        this.y = Math.floor(Math.random() * maxY) * this.gridSize;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);

        // Add some visual flair with a shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        ctx.strokeStyle = '#FF4757';
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        ctx.shadowBlur = 0;
    }

    checkCollision(x, y) {
        return x === this.x && y === this.y;
    }
}