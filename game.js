const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- ФОН ---
const bgImage = new Image();
bgImage.src = "sply.jpg"; // переконайся, що файл у тій же папці або зміни шлях

// --- МУЗИКА ---
const music = new Audio("music2.mp3");
music.loop = true;
music.volume = 0.5;

let musicStarted = false;
function startMusic() {
    if (!musicStarted) {
        music.play().catch(() => {});
        musicStarted = true;
    }
}

// --- ПТИЦЯ ---
let bird = {
    x: 100,
    y: canvas.height / 2,
    size: 40,
    velocity: 0
};

let gravity = 0.3;
let jumpPower = -9;
let pipes = [];
let score = 0;
let gameActive = true;

// --- СПАВН ТРУБ ---
function spawnPipe() {
    const gap = 300;
    const topHeight = Math.random() * (canvas.height - gap - 100) + 25;

    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: topHeight + gap,
        passed: false
    });
}

// Труби з'являються кожні 1.4 сек
setInterval(spawnPipe, 1400);

// --- КЕРУВАННЯ ---
function jump() {
    if (!gameActive) return;
    bird.velocity = jumpPower;
    startMusic();
}

document.addEventListener("click", jump);
document.addEventListener("touchstart", jump);
document.addEventListener("keydown", e => {
    if (e.code === "Space") jump();
    if (!gameActive && e.code === "KeyR") restart();
});

// --- UPDATE ---
function update() {
    if (!gameActive) return;

    bird.velocity += gravity;
    bird.y += bird.velocity;

    if (bird.y < 0 || bird.y + bird.size > canvas.height) {
        gameActive = false;
    }

    pipes.forEach(pipe => {
        pipe.x -= 4;

        // Колізія
        if (
            bird.x < pipe.x + 70 &&
            bird.x + bird.size > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.size > pipe.bottom)
        ) {
            gameActive = false;
        }

        // Рахунок
        if (!pipe.passed && bird.x > pipe.x + 70) {
            pipe.passed = true;
            score++;
        }
    });

    // Видаляємо труби, що вийшли за екран
    pipes = pipes.filter(p => p.x > -80);
}

// --- ФОН З COVER ---
function drawBackgroundCover() {
    const scale = Math.max(
        canvas.width / bgImage.width,
        canvas.height / bgImage.height
    );

    const x = (canvas.width - bgImage.width * scale) / 2;
    const y = (canvas.height - bgImage.height * scale) / 2;

    ctx.drawImage(
        bgImage,
        x,
        y,
        bgImage.width * scale,
        bgImage.height * scale
    );
}

// --- DRAW ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackgroundCover();

    // Птиця
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.size, bird.size);

    // Труби
    ctx.fillStyle = "green";
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, 70, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, 70, canvas.height - pipe.bottom);
    });

    // Рахунок
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Score: " + score, 40, 70);

    // GAME OVER
    if (!gameActive) {
        ctx.fillStyle = "red";
        ctx.font = "60px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 180, canvas.height / 2);
        ctx.font = "30px Arial";
        ctx.fillText("Натисни R для перезапуску", canvas.width / 2 - 170, canvas.height / 2 + 50);
    }
}

// --- RESTART ---
function restart() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameActive = true;
}

// --- LOOP ---
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// --- RESIZE ---
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// --- ЗАПУСК ---
bgImage.onload = () => {
    console.log("Background loaded!");
    gameLoop();
};

bgImage.onerror = () => {
    console.error("Failed to load background image.");
};

