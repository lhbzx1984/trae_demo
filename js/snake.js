class Snake {
    constructor(canvasWidth, canvasHeight, gridSize) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.gridSize = gridSize;
        this.reset();
    }

    reset() {
        this.body = [
            { x: 10 * this.gridSize, y: 10 * this.gridSize },
            { x: 9 * this.gridSize, y: 10 * this.gridSize },
            { x: 8 * this.gridSize, y: 10 * this.gridSize }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.color = '#4ECDC4';
        this.score = 0;
        this.level = 1;
        this.speed = 150; // milliseconds between moves
    }

    changeDirection(newDirection) {
        // Prevent reversing direction immediately
        if (this.direction === 'up' && newDirection === 'down') return;
        if (this.direction === 'down' && newDirection === 'up') return;
        if (this.direction === 'left' && newDirection === 'right') return;
        if (this.direction === 'right' && newDirection === 'left') return;

        this.nextDirection = newDirection;
    }

    update() {
        this.direction = this.nextDirection;

        const head = { ...this.body[0] };

        switch (this.direction) {
            case 'up':
                head.y -= this.gridSize;
                break;
            case 'down':
                head.y += this.gridSize;
                break;
            case 'left':
                head.x -= this.gridSize;
                break;
            case 'right':
                head.x += this.gridSize;
                break;
        }

        this.body.unshift(head);
        return head;
    }

    grow() {
        this.score += 10;

        // Level up every 50 points
        if (this.score % 50 === 0 && this.level < 10) {
            this.level++;
            this.speed = Math.max(50, this.speed - 10); // Increase speed, minimum 50ms
        }

        // Color changes with level
        this.updateColor();
    }

    updateColor() {
        const colors = ['#4ECDC4', '#44A08D', '#00B4D8', '#0077BE', '#0066CC'];
        const colorIndex = Math.min(this.level - 1, colors.length - 1);
        this.color = colors[colorIndex];
    }

    checkWallCollision() {
        const head = this.body[0];
        return (
            head.x < 0 ||
            head.x >= this.canvasWidth ||
            head.y < 0 ||
            head.y >= this.canvasHeight
        );
    }

    checkSelfCollision() {
        const head = this.body[0];
        return this.body.slice(1).some(segment =>
            segment.x === head.x && segment.y === head.y
        );
    }

    draw(ctx, showGrid) {
        // Draw grid if enabled
        if (showGrid) {
            this.drawGrid(ctx);
        }

        // Draw snake body
        this.body.forEach((segment, index) => {
            if (index === 0) {
                // Draw head with eyes
                ctx.fillStyle = this.color;
                ctx.fillRect(segment.x, segment.y, this.gridSize, this.gridSize);

                // Draw eyes
                ctx.fillStyle = 'white';
                const eyeSize = this.gridSize / 4;
                const eyeOffset = this.gridSize / 8;

                if (this.direction === 'right') {
                    ctx.fillRect(segment.x + this.gridSize - eyeSize - eyeOffset, segment.y + eyeOffset, eyeSize, eyeSize);
                    ctx.fillRect(segment.x + this.gridSize - eyeSize - eyeOffset, segment.y + this.gridSize - eyeSize - eyeOffset, eyeSize, eyeSize);
                } else if (this.direction === 'left') {
                    ctx.fillRect(segment.x + eyeOffset, segment.y + eyeOffset, eyeSize, eyeSize);
                    ctx.fillRect(segment.x + eyeOffset, segment.y + this.gridSize - eyeSize - eyeOffset, eyeSize, eyeSize);
                } else if (this.direction === 'up') {
                    ctx.fillRect(segment.x + eyeOffset, segment.y + eyeOffset, eyeSize, eyeSize);
                    ctx.fillRect(segment.x + this.gridSize - eyeSize - eyeOffset, segment.y + eyeOffset, eyeSize, eyeSize);
                } else if (this.direction === 'down') {
                    ctx.fillRect(segment.x + eyeOffset, segment.y + this.gridSize - eyeSize - eyeOffset, eyeSize, eyeSize);
                    ctx.fillRect(segment.x + this.gridSize - eyeSize - eyeOffset, segment.y + this.gridSize - eyeSize - eyeOffset, eyeSize, eyeSize);
                }

                ctx.fillStyle = 'black';
                ctx.fillRect(segment.x + this.gridSize / 2 - eyeSize / 4, segment.y + this.gridSize / 2 - eyeSize / 4, eyeSize / 2, eyeSize / 2);
            } else {
                // Draw body segments
                ctx.fillStyle = this.color;
                ctx.fillRect(segment.x, segment.y, this.gridSize, this.gridSize);

                // Add a subtle gradient effect to body
                const gradient = ctx.createRadialGradient(
                    segment.x + this.gridSize / 2, segment.y + this.gridSize / 2, 0,
                    segment.x + this.gridSize / 2, segment.y + this.gridSize / 2, this.gridSize / 2
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
                ctx.fillStyle = gradient;
                ctx.fillRect(segment.x, segment.y, this.gridSize, this.gridSize);
            }

            // Add border to each segment
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(segment.x, segment.y, this.gridSize, this.gridSize);
        });
    }

    drawGrid(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let x = 0; x <= this.canvasWidth; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvasHeight);
            ctx.stroke();
        }

        for (let y = 0; y <= this.canvasHeight; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvasWidth, y);
            ctx.stroke();
        }
    }

    getCurrentSpeed() {
        return this.speed;
    }

    getScore() {
        return this.score;
    }

    getLevel() {
        return this.level;
    }
}