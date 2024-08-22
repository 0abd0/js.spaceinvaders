const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 30,
    width: 40,
    height: 20,
    dx: 5
};

const bullets = [];
const enemyBullets = [];
const enemies = [];

const enemyRowCount = 3;
const enemyColumnCount = 5;
const enemyWidth = 40;
const enemyHeight = 20;
const enemyPadding = 10;
const enemyOffsetTop = 30;
const enemyOffsetLeft = 30;
let enemyDirection = 1;  // 1 for right, -1 for left
let enemySpeed = 2;       // Speed of the enemies
let enemiesMoveDown = false;

for (let i = 0; i < enemyRowCount; i++) {
    enemies[i] = [];
    for (let j = 0; j < enemyColumnCount; j++) {
        const enemyX = (j * (enemyWidth + enemyPadding)) + enemyOffsetLeft;
        const enemyY = (i * (enemyHeight + enemyPadding)) + enemyOffsetTop;
        enemies[i][j] = { x: enemyX, y: enemyY, status: 1 };
    }
}

let rightPressed = false;
let leftPressed = false;
let spacePressed = false;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        spacePressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        spacePressed = false;
    }
}

function drawPlayer() {
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function movePlayer() {
    if (rightPressed && player.x < canvas.width - player.width) {
        player.x += player.dx;
    } else if (leftPressed && player.x > 0) {
        player.x -= player.dx;
    }
}

function drawEnemies() {
    for (let i = 0; i < enemyRowCount; i++) {
        for (let j = 0; j < enemyColumnCount; j++) {
            if (enemies[i][j].status === 1) {
                ctx.fillStyle = 'red';
                ctx.fillRect(enemies[i][j].x, enemies[i][j].y, enemyWidth, enemyHeight);
            }
        }
    }
}

function moveEnemies() {
    let hitEdge = false;

    for (let i = 0; i < enemyRowCount; i++) {
        for (let j = 0; j < enemyColumnCount; j++) {
            const enemy = enemies[i][j];
            if (enemy.status === 1) {
                enemy.x += enemySpeed * enemyDirection;

                // Check if any enemy hits the edge
                if (enemy.x + enemyWidth > canvas.width || enemy.x < 0) {
                    hitEdge = true;
                }
            }
        }
    }

    // If an edge is hit, change direction and move down
    if (hitEdge) {
        enemyDirection *= -1;
        enemiesMoveDown = true;
    }

    if (enemiesMoveDown) {
        for (let i = 0; i < enemyRowCount; i++) {
            for (let j = 0; j < enemyColumnCount; j++) {
                const enemy = enemies[i][j];
                if (enemy.status === 1) {
                    enemy.y += enemyHeight;
                }
            }
        }
        enemiesMoveDown = false;
    }
}

function drawBullets() {
    ctx.fillStyle = 'yellow';
    bullets.forEach((bullet, index) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y -= bullet.dy;

        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

function drawEnemyBullets() {
    ctx.fillStyle = 'white';
    enemyBullets.forEach((bullet, index) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y += bullet.dy;

        // Remove bullet if it goes out of bounds
        if (bullet.y > canvas.height) {
            enemyBullets.splice(index, 1);
        }

        // Check if the bullet hits the player
        if (
            bullet.x > player.x &&
            bullet.x < player.x + player.width &&
            bullet.y > player.y &&
            bullet.y < player.y + player.height
        ) {
            alert('Game Over!');
            document.location.reload();
        }
    });
}

function shootBullet() {
    if (spacePressed) {
        bullets.push({
            x: player.x + player.width / 2 - 2.5,
            y: player.y,
            width: 5,
            height: 10,
            dy: 7
        });
        spacePressed = false;
    }
}

function enemyShoot() {
    const shootingEnemyRow = Math.floor(Math.random() * enemyRowCount);
    const shootingEnemyCol = Math.floor(Math.random() * enemyColumnCount);
    const enemy = enemies[shootingEnemyRow][shootingEnemyCol];

    if (enemy.status === 1) {
        enemyBullets.push({
            x: enemy.x + enemyWidth / 2 - 2.5, // center the bullet to the enemy
            y: enemy.y + enemyHeight, // start from the bottom of the enemy
            width: 5,
            height: 10,
            dy: 3
        });
    }
}

function collisionDetection() {
    bullets.forEach((bullet, bulletIndex) => {
        for (let i = 0; i < enemyRowCount; i++) {
            for (let j = 0; j < enemyColumnCount; j++) {
                const enemy = enemies[i][j];
                if (enemy.status === 1) {
                    if (
                        bullet.x > enemy.x &&
                        bullet.x < enemy.x + enemyWidth &&
                        bullet.y > enemy.y &&
                        bullet.y < enemy.y + enemyHeight
                    ) {
                        enemy.status = 0;
                        bullets.splice(bulletIndex, 1);
                    }
                }
            }
        }
    });
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    clearCanvas();
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawEnemyBullets();
    collisionDetection();
    movePlayer();
    moveEnemies();
    shootBullet();

    // Randomly make enemies shoot
    if (Math.random() < 0.02) {
        enemyShoot();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
