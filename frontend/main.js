// main.js
import { api } from './api.js';

let lastCoinSpawnMeters = 0;
let distanceSinceLastDanya = 0;
let nextDanyaDistance = 0;
let cortage = [];
let cortageImgs = [];
let cortageSfx;
let nextCortageDistance = 0;
let distanceSinceLastCortage = 0;
let danyas = [];
let danyaImg, danyaSfx;
let killedQuadCount = 0;
let runner;
let obstacles = [];
let coins = [];
let bestCoins = 0;
let distanceTravelledPx = 0;
let kilometers = 0;
let coinCount = 0;
let lastMilestoneMeters = 0;
let frameCount = 0;
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// Game speed in pixels per frame
let speed = 2.5;
let gameStarted = false;
let allowMovement = false;
export let isGameOver = false;
let bgMusic;
let bg;
let ctx;
let uiCtx;
let loader;

// Speed boost: +2% every 700 points
let lastSpeedBoostScore = 0; // tracks score at last 2% boost

// Global for minimum distance between any two spawns
let distanceSinceLastSpawn = 0;             // Distance since any object spawned
const minSpawnDistance = 160 * 3;           // Minimum horizontal distance between spawns (3 runner widths)
let minDistanceBetweenSpawns = randomRange(800, 1600);
// Random spawn scheduling
let nextCoinFrame, nextInspectorFrame, nextServiceFrame, nextCheckFrame, nextQuadroFrame;
let lastSpawnFrame = 0;         // Frame index of the last spawn
const minFrameGap = Math.ceil(100 / 6);  // Minimum frames between spawns (~17)

// Valera distance-based spawn tracking
let distanceSinceLastValera = 0;
let nextValeraDistance;
let valeras = [];

// Track distance since last pit (obstacle) for spaced spawning
let distanceSinceLastPit = 0;
let nextPitDistance;


let runnerImg, coinImg, obstacleImg, serviceImg, checkImg, inspectorImg, quadroImg, quadroFallImg, valeraImg;
let gameOverScreen;
let loadSfx, startSfx, inspectorSfx, serviceSfx, checkSfx, deathSfx, valeraSfx;

let inspectors = [];
let services = [];
let checks = [];
let quadros = [];

// Popups for score and penalties
let popups = [];

let bgX1 = 0;  // First background tile offset
let bgX2;      // Second tile offset, initialized in resetGame()

// Physic constants for jump
const gravity = 0.15;
const jumpPower = -10;

// Pit spawn center Y-coordinate (e.g., mouse-measured)
const pitSpawnCenterY = 370;

// main.js
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await api.login(username, password);
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', username);
        document.getElementById('loginOverlay').style.display = 'none';
    } catch (error) {
        alert('Ошибка входа');
    }
}

// Добавьте в начало main.js
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth.html';
        return false;
    }
    return true;
}

// Проверяем авторизацию при загрузке
if (!checkAuth()) {
    // Если нет авторизации, остальной код не выполняется
    throw new Error('Unauthorized');
}

// В функции gameOver или там, где заканчивается игра:
export async function GameOver() {

    // Сохраняем счет, если пользователь авторизован
    const token = localStorage.getItem('token');
    if (token) {
        try {
            await api.saveScore({
                game: 'runner',
                user_name: localStorage.getItem('username'), // Сохраняем при логине
                points: {
                    distance: Math.floor(distanceTravelledPx / (160/3)),
                    money: coinCount
                }
            });
        } catch (error) {
            console.error('Failed to save score:', error);
        }
    }
}

// Asset loading
function loadAssets(onComplete) {
    let loaded = 0;
    let toLoad = 18;

    runnerImg = new Image();
    runnerImg.src = 'assets/denis_runner.png';
    runnerImg.onload = checkLoaded;

    coinImg = new Image();
    coinImg.src = 'assets/coin.png';
    coinImg.onload = checkLoaded;

    obstacleImg = new Image();
    obstacleImg.src = 'assets/pothole.png';
    obstacleImg.onload = checkLoaded;

    serviceImg = new Image();
    serviceImg.src = 'assets/service.png';
    serviceImg.onload = checkLoaded;

    checkImg = new Image();
    checkImg.src = 'assets/check_engine.png';
    checkImg.onload = checkLoaded;

    inspectorImg = new Image();
    inspectorImg.src = 'assets/inspector.png';
    inspectorImg.onload = checkLoaded;

    quadroImg = new Image();
    quadroImg.src = 'assets/quadro.png';
    quadroImg.onload = checkLoaded;

    quadroFallImg = new Image();
    quadroFallImg.src = 'assets/quadro1.png';
    quadroFallImg.onload = checkLoaded;

    gameOverScreen = new Image();
    gameOverScreen.src = 'assets/game_over_screen.webp';
    gameOverScreen.onload = checkLoaded;


    startSfx = new Audio('assets/start.mp3');
    startSfx.addEventListener('canplaythrough', checkLoaded, { once: true });

    inspectorSfx = new Audio('assets/inspector_sfx.mp3');
    inspectorSfx.addEventListener('canplaythrough', checkLoaded, { once: true });

    serviceSfx = new Audio('assets/service.mp3');
    serviceSfx.addEventListener('canplaythrough', checkLoaded, { once: true });

    deathSfx = new Audio('assets/death_sfx.mp3');
    deathSfx.addEventListener('canplaythrough', checkLoaded, { once: true });

    checkSfx = new Audio('assets/Check_Sound.mp3');
    checkSfx.addEventListener('canplaythrough', checkLoaded, { once: true });
    toLoad += 1;

    // Valera sprite and sound
    valeraImg = new Image();
    valeraImg.src = 'assets/Valera_runner.png';
    valeraImg.onload = checkLoaded;

    valeraSfx = new Audio('assets/valera.mp3');
    valeraSfx.addEventListener('canplaythrough', checkLoaded, { once: true });

    danyaImg = new Image();
    danyaImg.src = 'assets/danya.png';
    danyaImg.onload = checkLoaded;

    danyaSfx = new Audio('assets/danya.mp3');
    danyaSfx.addEventListener('canplaythrough', checkLoaded, { once: true });
    toLoad += 2;

    const cortageNames = ['Cortage1.png', 'Cortage2.png', 'Cortage3.png', 'Cortage4.png', 'Cortage5.png', 'Cortage6.png', 'Cortage7.png', 'Cortage8.png'];
    cortageNames.forEach(name => {
        const img = new Image();
        img.src = 'assets/' + name;
        img.onload = checkLoaded;
        cortageImgs.push(img);
        toLoad += 1;
    });

    cortageSfx = new Audio('assets/cortage.mp3');
    cortageSfx.addEventListener('canplaythrough', checkLoaded, { once: true });
    toLoad += 1;

    // Example asset loading
    // Изменяем путь к изображению фона на новый формат и устанавливаем оригинальное разрешение
    bg = new Image();
    bg.src = 'assets/city_background.webp';  // Новый формат webp
    bg.onload = () => {
        bg.width = 1536;   // Устанавливаем оригинальное разрешение
        bg.height = 1024;  // Устанавливаем оригинальное разрешение
        checkLoaded();
    };

    bgMusic = new Audio('assets/bgMusic.mp3');
    bgMusic.volume = 0.5;
    bgMusic.addEventListener('canplaythrough', checkLoaded, { once: true });

    loader = new Image();
    loader.src = 'assets/splash_screen.webp';
    loader.onload = checkLoaded;

    function checkLoaded() {
        loaded++;
        if (loaded === toLoad) {
            onComplete();
        }
    }
}

// Runner object
const groundY = 215; // raised additional 10% (40px) higher

function createRunner() {
    return {
        x: 50,
        y: groundY,  // sits on the ground
        width: 160,  // увеличиваем в два раза (160px)
        height: 80,  // увеличиваем в два раза (80px)
        vy: 0,  // вертикальная скорость
        onGround: true,  // флаг, чтобы знать, что игрок на земле
        sprite: null,  // спрайт
        tiltAngle: 0,  // угол наклона (используется для всех стадий)
        jumpStage: 0,  // стадия прыжка (0 - статична, 1 - наклон назад, 2 - статична, 3 - наклон вперёд, 4 - статична)
    };
}

export function resetGame() {
    // Show HUD overlays on restart
    document.getElementById('scoreDisplay').style.display = 'block';
    document.getElementById('bestDisplay').style.display  = 'block';
    document.getElementById('killDisplay').style.display  = 'block';
    // Hide restart button if present
    const restartBtn = document.getElementById('restartButton');
    if (restartBtn) restartBtn.style.display = 'none';
    killedQuadCount = 0;
    totalServicePaid = 0;
    totalInspectorPaid = 0;
    coinCount = 0;
    kilometers = 0;
    distanceTravelledPx = 0;
    lastMilestoneMeters = 0;
    runner = createRunner();
    obstacles = [];
    coins = [];
    inspectors = [];
    services = [];
    checks = [];
    quadros = [];
    popups = [];
    valeras = [];
    frameCount = 0;
    isGameOver = false;
    gameStarted = false;
    speed = 2.5;
    if (bgMusic) {
        bgMusic.currentTime = 0;
        bgMusic.pause();
    }
    bgX1 = 0;
    bgX2 = canvas.width;
    // Initialize next spawn frames at random intervals from 0
    nextCoinFrame      = randomRange(120, 200);
    nextInspectorFrame = randomRange(350, 450);
    nextServiceFrame   = randomRange(500, 600);
    nextCheckFrame     = randomRange(250, 350);
    nextQuadroFrame    = randomRange(75, 125);
    distanceSinceLastPit = 0;
    nextPitDistance = randomRange(1000, 1500);
    lastSpawnFrame = 0;
    distanceSinceLastSpawn = 0;
    minDistanceBetweenSpawns = randomRange(800, 1600);
    distanceSinceLastValera = 0;
    nextValeraDistance = randomRange(10000, 20000);  // twice as often
    danyas = [];
    cortage = [];
    nextCortageDistance = randomRange(10000, 20000);
    distanceSinceLastCortage = 0;
    distanceSinceLastDanya = 0;
    nextDanyaDistance = randomRange(5000, 10000);
}

function initGame() {
    resetGame();
    gameStarted = true;
    if (bgMusic) {
        bgMusic.currentTime = 0;
        bgMusic.play().catch(e => {
            console.warn('Audio autoplay failed:', e);
        });
    }
}

function spawnObstacle() {
    const r = Math.random();
    const pitSize = 75;
    const pitY = pitSpawnCenterY - pitSize / 2 - (canvas.height * 0.28);

    if (r < 0.25) {
        // Pit
        obstacles.push({
            x: 800,
            y: pitY,
            width: pitSize,
            height: pitSize,
            speed: 6
        });
    } else if (r < 0.5) {
        // Quadcopter
        quadros.push({
            x: 800,
            y: 40,
            width: 100,
            height: 60,
            speed: 6,
            falling: false
        });
    } else if (r < 0.65) {
        // Service
        const serviceY = pitSpawnCenterY - 75 / 2 - (canvas.height * 0.28);
        services.push({
            x: 800,
            y: serviceY,
            width: 80,
            height: 80,
            hitboxOffsetX: 20,
            hitboxWidth: 40,
            hitboxHeight: 40
        });
    } else if (r < 0.85) {
        // Check Engine
        checks.push({
            x: 800,
            y: 60,
            width: 75,
            height: 75,
            speed: 6
        });
    } else {
        // Inspector
        const inspectorY = pitSpawnCenterY - 75 / 2 - (canvas.height * 0.28);
        inspectors.push({
            x: 800,
            y: inspectorY,
            width: 50,
            height: 70,
            speed: 6
        });
    }
}

function spawnCoin() {
    coins.push({
        x: 800,
        y: Math.random() * 180 + 40,
        width: 75,  // увеличиваем до 75x75
        height: 75, // увеличиваем до 75x75
        speed: 6
    });
}

function setupInput() {
    document.addEventListener('keydown', (e) => {
        // Запрет нажатия пробела на загрузочном экране и в отсчёте
        if (!allowMovement) return;

        if (!gameStarted && e.code === 'Space') {
            initGame();  // Начало игры при нажатии пробела
        }
        if (isGameOver && (e.code === 'Space' || e.code === 'Enter' || e.key === 'Enter')) {
            e.preventDefault();
            GameOver();
            resetGame();  // Рестарт при нажатии пробела или Enter
        }
        if (!gameStarted || isGameOver) return;
        if (gameStarted && !isGameOver && (e.code === 'ArrowUp' || e.code === 'Space')) {  // Прыжок при нажатии стрелки вверх или пробела
            if (runner.onGround) {
                runner.vy = jumpPower;  // Используем константу jumpPower
                runner.onGround = false;  // Игрок в воздухе
                runner.jumpStage = 1;  // Первая стадия — наклон назад
            }
        }
    });
}

function drawRunner(r) {
    if (runnerImg && runnerImg.complete) {
        // Не очищаем область runner здесь, чтобы не затирать фон и другие элементы
        ctx.save();  // Сохраняем текущее состояние
        ctx.translate(r.x + r.width / 2, r.y + r.height / 2);  // Перемещаем в центр модели
        // В зависимости от стадии прыжка, наклоняем машину
        ctx.rotate((runner.tiltAngle * Math.PI) / 180);  // Применяем наклон
        ctx.drawImage(runnerImg, -r.width / 2, -r.height / 2, r.width, r.height);  // Отрисовываем модель
        ctx.restore();  // Восстанавливаем состояние канваса
    }
}

function drawObstacle(o) {
    if (obstacleImg && obstacleImg.complete) {
        ctx.drawImage(obstacleImg, o.x, o.y, o.width, o.height);
    } else {
        ctx.fillStyle = '#222';
        ctx.fillRect(o.x, o.y, o.width, o.height);
    }
}

function drawCoin(c) {
    if (coinImg && coinImg.complete) {
        ctx.drawImage(coinImg, c.x, c.y, c.width, c.height);  // теперь 75x75
    } else {
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.arc(c.x + c.width / 2, c.y + c.height / 2, c.width / 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawService(s) {
    if (serviceImg && serviceImg.complete) {
        ctx.drawImage(serviceImg, s.x, s.y, s.width, s.height);
    } else {
        ctx.fillStyle = '#0f0';
        ctx.fillRect(s.x, s.y, s.width, s.height);
    }
}

function drawCheck(c) {
    if (checkImg && checkImg.complete) {
        ctx.drawImage(checkImg, c.x, c.y, c.width, c.height);
    } else {
        ctx.fillStyle = '#ff0';
        ctx.fillRect(c.x, c.y, c.width, c.height);
    }
}

function drawInspector(i) {
    if (inspectorImg && inspectorImg.complete) {
        ctx.drawImage(inspectorImg, i.x, i.y, i.width, i.height);
    } else {
        ctx.fillStyle = '#f00';
        ctx.fillRect(i.x, i.y, i.width, i.height);
    }
}

function drawQuadro(q) {
    const img = q.falling ? quadroFallImg : quadroImg;
    if (img && img.complete) {
        ctx.drawImage(img, q.x, q.y, q.width, q.height);
    } else {
        ctx.fillStyle = '#0ff';
        ctx.fillRect(q.x, q.y, q.width, q.height);
    }
}

function drawUI() {
    // Update vector HTML overlays instead of canvas text
    const scoreEl = document.getElementById('scoreDisplay');
    if (scoreEl) {
        scoreEl.innerText = 'Километраж: ' + kilometers.toFixed(2) + ' км';
        // Style for top left corner
        scoreEl.style.position = 'absolute';
        scoreEl.style.textShadow = '2px 2px 4px rgba(0,0,0,0.6)';
        scoreEl.style.left = '20px';
        scoreEl.style.top = '10px';
        scoreEl.style.right = 'auto';
        scoreEl.style.transform = 'none';
        scoreEl.style.textAlign = 'left';
        scoreEl.style.zIndex = '10';
        scoreEl.style.fontFamily = 'Arial';
        scoreEl.style.fontSize = '24px';
        scoreEl.style.color = 'white';
        scoreEl.style.display = 'block';
    }

    // Coin display: ensure it exists and style/position it
    let coinDisplay = document.getElementById('coinDisplay');
    if (!coinDisplay) {
        coinDisplay = document.createElement('div');
        coinDisplay.id = 'coinDisplay';
        document.body.appendChild(coinDisplay);
    }

    if (!isGameOver) {
        coinDisplay.innerText = 'Монеты: ' + coinCount + ' 💸';
        coinDisplay.style.position = 'absolute';
        coinDisplay.style.left = '20px';
        coinDisplay.style.top = '40px';
        coinDisplay.style.right = 'auto';
        coinDisplay.style.transform = 'none';
        coinDisplay.style.textAlign = 'left';
        coinDisplay.style.zIndex = '10';
        coinDisplay.style.fontFamily = 'Arial';
        coinDisplay.style.fontSize = '24px';
        coinDisplay.style.color = 'white';
        coinDisplay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.6)';
        coinDisplay.style.display = 'block';
    } else {
        coinDisplay.style.display = 'none';
        const summaryEl = document.getElementById('summaryDisplay');
        if (summaryEl) summaryEl.style.display = 'none';
        const paymentsDiv = document.getElementById('paymentsDisplay');
        if (paymentsDiv) paymentsDiv.style.display = 'none';
    }


    // If you have best and kill displays, update them similarly:
    // Show start prompt or game over via overlay DIVs:
    // const startEl = document.getElementById('startPrompt');
    // if (!gameStarted && !isGameOver && startEl) startEl.style.display = 'block'; else if (startEl) startEl.style.display = 'none';
    // const gameOverEl = document.getElementById('gameOverScreen');
    // if (isGameOver && gameOverEl) gameOverEl.style.display = 'block'; else if (gameOverEl) gameOverEl.style.display = 'none';
    // (Removed mouse coordinate debug display)
}

function update() {
    if (!gameStarted || isGameOver) return;
    if (!allowMovement) return;
    if (gameStarted) {
        speed += 0.00002;
        // -- Новый блок спавна Валеры, Дани, Кортежа --
        distanceSinceLastValera += speed;
        distanceSinceLastDanya += speed;
        distanceSinceLastCortage += speed;

        const noRacersOnScreen = valeras.length === 0 && danyas.length === 0 && cortage.length === 0;

        if (noRacersOnScreen) {
            if (distanceSinceLastCortage >= nextCortageDistance) {
                spawnCortage();
                distanceSinceLastCortage = 0;
                nextCortageDistance = randomRange(10000, 20000);
            } else if (distanceSinceLastValera >= nextValeraDistance) {
                spawnValera();
                distanceSinceLastValera = 0;
                nextValeraDistance = randomRange(5000, 10000);
            } else if (distanceSinceLastDanya >= nextDanyaDistance) {
                spawnDanya();
                distanceSinceLastDanya = 0;
                nextDanyaDistance = randomRange(5000, 10000);
            }
        }

        cortage.forEach((car, i) => {
            // Только первая машина кортежа запускает звук
            if (i === 0 && !car.audioPlayed && (car.x - runner.x) <= 500) {
                cortageSfx.currentTime = 0;
                cortageSfx.play().catch(() => {});
                car.audioPlayed = true;
            }
            car.x -= speed * 1.32;
        });

        // Удаляем кортеж, когда последняя машина уехала
        if (cortage.length > 0 && cortage[cortage.length - 1].x + cortage[cortage.length - 1].width < 0) {
            cortage = [];
        }
    }

    // Accumulate distance traveled for spawn logic
    distanceSinceLastSpawn += 6;
    distanceTravelledPx += speed;
    const metersTravelled = distanceTravelledPx / (160 / 3);
    kilometers = metersTravelled / 1000;

    if (metersTravelled - lastMilestoneMeters >= 500) {
        coinCount += 50;
        lastMilestoneMeters += 500;
    }

    frameCount++;

    // Scroll and wrap two background tiles using game speed
    bgX1 -= speed;
    bgX2 -= speed;
    if (bgX1 <= -canvas.width) bgX1 = bgX2 + canvas.width;
    if (bgX2 <= -canvas.width) bgX2 = bgX1 + canvas.width;

    // Гравитация
    runner.vy += gravity;
    runner.y  += runner.vy;


    // Ground collision
    let targetAngleDeg = 0;
    if (runner.y >= groundY) {
        runner.y = groundY;
        runner.vy = 0;
        runner.onGround = true;
        runner.jumpStage = 0;
        targetAngleDeg = 0;
    } else {
        // Когда игрок в воздухе, проверяем стадии прыжка
        runner.onGround = false;
        if (runner.jumpStage === 1) {
            // Наклон назад на 45 градусов (взлёт)
            targetAngleDeg = -45;
            if (runner.vy >= 0) {  // Как только скорость вверх стала 0 или вниз, переходим к статичной фазе
                runner.jumpStage = 2;
            }
        } else if (runner.jumpStage === 2) {
            // Статичная позиция (максимальная точка)
            targetAngleDeg = 0;
            if (runner.vy > 0) {  // Как только начали падать, переходим к наклону вперёд
                runner.jumpStage = 3;
            }
        } else if (runner.jumpStage === 3) {
            // Наклон вперёд на 45 градусов (падение)
            targetAngleDeg = 45;
        }
    }
    // Плавное сглаживание наклона
    runner.tiltAngle += (targetAngleDeg - runner.tiltAngle) * 0.1;

    // Define full hitbox for collisions: entire runner rectangle
    const runnerHitbox = {
      x: runner.x,
      y: runner.y,
      width: runner.width,
      height: runner.height
    };

    // Obstacles spawn at random distances between 500 and 1000px
    distanceSinceLastPit += 6; // obstacle speed
    if (distanceSinceLastPit >= nextPitDistance && distanceSinceLastSpawn >= minSpawnDistance + minDistanceBetweenSpawns) {
        spawnObstacle();
        distanceSinceLastPit = 0;
        nextPitDistance = randomRange(1000, 1500);
        distanceSinceLastSpawn = 0;
        minDistanceBetweenSpawns = randomRange(800, 1600);
    }
    // --- Новый универсальный блок спавна монеты и препятствий ---
    if (distanceSinceLastSpawn >= minSpawnDistance + minDistanceBetweenSpawns) {
        spawnObstacle();
        distanceSinceLastPit = 0;
        distanceSinceLastSpawn = 0;
        minDistanceBetweenSpawns = randomRange(800, 1600);
    }

    const meters = distanceTravelledPx / (160 / 3);
    if (meters - lastCoinSpawnMeters >= randomRange(100, 200)) {
        spawnCoin();
        lastCoinSpawnMeters = meters;
    }
    obstacles.forEach(o => o.x -= speed);
    obstacles = obstacles.filter(o => o.x + o.width > 0);

    // Coins
    // coins are now handled in the new universal spawn block above
    coins.forEach(c => c.x -= speed);
    coins = coins.filter(c => c.x + c.width > 0);

    // (Removed separate spawns for inspectors, services, checks, and quadros - now handled by spawnObstacle)

    // Valera (distance-based): logic handled above

    // Move and clean
    inspectors.forEach(i => i.x -= speed);
    services.forEach(s => s.x -= speed);
    checks.forEach(c => c.x -= speed);
    quadros.forEach(q => q.x -= speed);

    inspectors = inspectors.filter(i => i.x + i.width > 0);
    services = services.filter(s => s.x + s.width > 0);
    checks = checks.filter(c => c.x + c.width > 0);
    quadros = quadros.filter(q => q.x + q.width > 0);

    // Move Valeras and play sound when 700px before runner
    valeras.forEach((v, i) => {
        // Play Valera sound 700px before reaching runner
        if (!v.audioPlayed && (v.x - runner.x) <= 700) {
            valeraSfx.currentTime = 0;
            valeraSfx.play().catch(() => {});
            v.audioPlayed = true;
        }
        // Move left at 1.2x game speed
        v.x -= speed * 1.2;  // move Valera 20% faster than base game speed
        // Remove when off-screen
        if (v.x + v.width < 0) valeras.splice(i, 1);
    });

    // Move and clean Danyas
    danyas.forEach((d, i) => {
        if (!d.audioPlayed && (d.x - runner.x) <= 700) {
            danyaSfx.currentTime = 0;
            danyaSfx.play().catch(() => {});
            d.audioPlayed = true;
        }
        d.x -= speed * 1.1;
        if (d.x + d.width < 0) danyas.splice(i, 1);
    });

    // Collisions

    // 1. Pothole: instant game over
    obstacles.forEach(o => {
        const pitHitbox = {
          x: o.x + o.width/2 - 2.5,
          y: o.y + o.height/2 - 2.5,
          width: 5,
          height: 5
        };
        if (rectsCollide(runnerHitbox, pitHitbox)) {
            isGameOver = true;
            if (bgMusic) bgMusic.pause();
            deathSfx.currentTime = 0;
            deathSfx.play();
        }
    });

    // 2. Coin: +25, green popup, no sound
    coins.forEach((c, i) => {
        if (rectsCollide(runnerHitbox, c)) {
            coinCount += 25;
            popups.push({ x: runner.x + runner.width/2, y: runner.y, text: '+25', color: 'green', alpha: 1 });
            coins.splice(i,1);
        }
    });

    // 3. Inspector: -50 or game over (custom hitbox: x, y, inspector.width x inspector.height)
    inspectors.forEach((ins, i) => {
        const inspectorHitbox = {
            x: ins.x,
            y: ins.y + 15,
            width: ins.width,
            height: ins.height
        };
        if (rectsCollide(runnerHitbox, inspectorHitbox)) {
            inspectors.splice(i,1);
            if (coinCount >= 50) {
                coinCount -= 50;
                totalInspectorPaid += 50;
                popups.push({ x: runner.x + runner.width/2, y: runner.y, text: '-50', color: 'red', alpha: 1 });
                inspectorSfx.currentTime = 0;
                inspectorSfx.play();
            } else {
                isGameOver = true;
                if (bgMusic) bgMusic.pause();
                deathSfx.currentTime = 0;
                deathSfx.play();
            }
        }
    });

    // 4. Service: -100 or game over
    services.forEach((s, i) => {
        const serviceHitbox = {
            x: s.x + (s.hitboxOffsetX || 0),
            y: s.y + (s.height - (s.hitboxHeight || s.height)) / 2,
            width: s.hitboxWidth || s.width,
            height: s.hitboxHeight || s.height
        };
        if (rectsCollide(runnerHitbox, serviceHitbox)) {
            if (coinCount >= 100) {
                coinCount -= 100;
                totalServicePaid += 100;
                popups.push({ x: runner.x + runner.width/2, y: runner.y, text: '-100', color: 'red', alpha: 1 });
                serviceSfx.currentTime = 0;
                serviceSfx.play();
            } else {
                isGameOver = true;
                if (bgMusic) bgMusic.pause();
                deathSfx.currentTime = 0;
                deathSfx.play();
            }
            services.splice(i,1);
        }
    });

    // 5. Check Engine: instant game over, new sound
    checks.forEach((ch, i) => {
        if (rectsCollide(runnerHitbox, ch)) {
            isGameOver = true;
            if (bgMusic) bgMusic.pause();
            checkSfx.currentTime = 0;
            checkSfx.play();
            checks.splice(i,1);
        }
    });

// 6. Quadcopter: on any contact trigger fall and popup if not yet scored
quadros.forEach((q, i) => {
    const buffer = 10;
    const quadroHitbox = {
        x: q.x - buffer,
        y: q.y - buffer,
        width: q.width + buffer * 2,
        height: q.height + buffer * 2
    };
    if (!q.falling && rectsCollide(runnerHitbox, quadroHitbox)) {
        q.falling = true;
        const framesToFall = 0.3 * 60;
        q.vyFall = (groundY - q.y) / framesToFall;
        popups.push({ x: runner.x + runner.width/2, y: runner.y, text: '+50', color: 'green', alpha: 1 });
        killedQuadCount++;
        coinCount += 50;
    }
});

    // Animate falling quadros and remove on ground or on collision
    quadros.forEach((q, idx) => {
        if (q.falling) {
            q.y += q.vyFall;
            if (rectsCollide(runnerHitbox, q) || q.y + q.height >= groundY) {
                quadros.splice(idx,1);
            }
        }
    });

    // Score


    // Speed boost: +0.1 every 500 points, max speed 6 (linear)
    if (metersTravelled - lastSpeedBoostScore >= 500) {
        speed = Math.min(speed + 0.1, 6);
        lastSpeedBoostScore = metersTravelled;
    }
}

function rectsCollide(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function draw() {
    // Очистка всего экрана
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);

    // Game Over UI block
    if (isGameOver) {
        // Скрываем надписи слева сверху при Game Over
        const scoreEl = document.getElementById('scoreDisplay');
        if (scoreEl) scoreEl.style.display = 'none';
        const coinDisplay = document.getElementById('coinDisplay');
        if (coinDisplay) coinDisplay.style.display = 'none';

        // Draw full-screen Game Over background image
        if (gameOverScreen && gameOverScreen.complete) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(gameOverScreen, 0, 0, canvas.width, canvas.height);
        }

        // --- Unified style settings ---
        const blockFontFamily = 'Arial';
        const blockFontSize = '24px';
        const blockMarginBottom = '8px';
        // vertical stacking: start at 35%, then +marginBottom per block
        let topPercents = [35, 35 + 7, 35 + 14, 35 + 21]; // 8% between, approx
        let currentTop = 35;
        // Score
        // (removed scoreEl block for game over screen)
        // Summary display: километраж и монеты
        const summaryEl = document.getElementById('summaryDisplay') || document.createElement('div');
        summaryEl.id = 'summaryDisplay';
        summaryEl.innerText = `Километраж: ${kilometers.toFixed(2)} км | Монеты: ${coinCount} 💸`;
        summaryEl.style.position = 'absolute';
        summaryEl.style.left = '50%';
        summaryEl.style.transform = 'translateX(-50%)';
        summaryEl.style.textAlign = 'center';
        summaryEl.style.zIndex = '6';
        summaryEl.style.top = 'calc(35% + 0px)';
        summaryEl.style.display = 'block';
        summaryEl.style.fontFamily = blockFontFamily;
        summaryEl.style.fontSize = blockFontSize;
        summaryEl.style.color = 'white';
        summaryEl.style.textShadow = '2px 2px 4px rgba(0,0,0,0.6)';
        document.body.appendChild(summaryEl);
        // Best
        const bestEl = document.getElementById('bestDisplay');
        if (bestEl) {
            if (coinCount > bestCoins) bestCoins = coinCount;
            bestEl.innerText = 'Рекорд по монетам: ' + bestCoins;
            bestEl.innerText = 'Рекорд по монетам: ' + bestCoins;
            bestEl.style.position = 'absolute';
            bestEl.style.left = '50%';
            bestEl.style.transform = 'translateX(-50%)';
            bestEl.style.textAlign = 'center';
            bestEl.style.zIndex = '6';
            bestEl.style.top = 'calc(35% + 40px)';
            bestEl.style.display = 'block';
            bestEl.style.fontFamily = blockFontFamily;
            bestEl.style.fontSize = blockFontSize;
            bestEl.style.marginBottom = blockMarginBottom;
        }
        // Kill display
        const killEl = document.getElementById('killDisplay');
        if (killEl) {
            // Можно добавить сюда количество сбитых квадрокоптеров, если есть переменная
            killEl.innerHTML = 'Квадрокоптеров сбито: <span style="color:#7CFC00;">' + killedQuadCount + '</span>';
            killEl.style.position = 'absolute';
            killEl.style.left = '50%';
            killEl.style.transform = 'translateX(-50%)';
            killEl.style.textAlign = 'center';
            killEl.style.zIndex = '6';
            killEl.style.top = 'calc(35% + 80px)';
            killEl.style.display = 'block';
            killEl.style.fontFamily = blockFontFamily;
            killEl.style.fontSize = blockFontSize;
            killEl.style.marginBottom = blockMarginBottom;
            // Цвет теперь задаётся через innerHTML для числа, основной цвет явно белый
            killEl.style.color = 'white';
        }
        // Payments block (vector, not innerHTML)
        let paymentsDiv = document.getElementById('paymentsDisplay');
        if (!paymentsDiv) {
            paymentsDiv = document.createElement('div');
            paymentsDiv.id = 'paymentsDisplay';
            document.body.appendChild(paymentsDiv);
        }
        paymentsDiv.style.position = 'absolute';
        paymentsDiv.style.left = '50%';
        paymentsDiv.style.transform = 'translateX(-50%)';
        paymentsDiv.style.textAlign = 'center';
        paymentsDiv.style.zIndex = '6';
        paymentsDiv.style.top = 'calc(35% + 120px)';
        paymentsDiv.style.fontFamily = blockFontFamily;
        paymentsDiv.style.fontSize = blockFontSize;
        paymentsDiv.style.marginBottom = blockMarginBottom;
        paymentsDiv.style.background = 'none';
        paymentsDiv.style.border = 'none';
        paymentsDiv.style.width = "auto";
        paymentsDiv.style.padding = "0";
        paymentsDiv.style.borderRadius = "0";
        while (paymentsDiv.firstChild) {
            paymentsDiv.removeChild(paymentsDiv.firstChild);
        }
        let showPayments = false;
        if (typeof totalServicePaid !== 'undefined' && totalServicePaid > 0) {
            const serviceDiv = document.createElement('div');
            serviceDiv.innerHTML = 'В сервисе заплатили: <span style="color: red;">-' + totalServicePaid + '</span>';
            serviceDiv.style.color = 'black';
            serviceDiv.style.marginBottom = blockMarginBottom;
            serviceDiv.style.fontFamily = blockFontFamily;
            serviceDiv.style.fontSize = blockFontSize;
            serviceDiv.style.padding = '5px 10px';
            serviceDiv.style.border = '1px solid white';
            serviceDiv.style.borderRadius = '10px';
            serviceDiv.style.backgroundColor = 'white';
            serviceDiv.style.display = 'inline-block';
            paymentsDiv.appendChild(serviceDiv);
            showPayments = true;
        }
        if (typeof totalInspectorPaid !== 'undefined' && totalInspectorPaid > 0) {
            const inspDiv = document.createElement('div');
            inspDiv.innerHTML = 'Капустникам заплатили: <span style="color: red;">-' + totalInspectorPaid + '</span>';
            inspDiv.style.color = 'black';
            inspDiv.style.marginBottom = blockMarginBottom;
            inspDiv.style.fontFamily = blockFontFamily;
            inspDiv.style.fontSize = blockFontSize;
            inspDiv.style.padding = '5px 10px';
            inspDiv.style.border = '1px solid white';
            inspDiv.style.borderRadius = '10px';
            inspDiv.style.backgroundColor = 'white';
            inspDiv.style.display = 'inline-block';
            paymentsDiv.appendChild(inspDiv);
            showPayments = true;
        }
        paymentsDiv.style.display = showPayments ? 'block' : 'none';

        // Show restart button (HTML vector)
        let restartBtn = document.getElementById('restartButton');
        if (!restartBtn) {
            restartBtn = document.createElement('div');
            restartBtn.id = 'restartButton';
            document.body.appendChild(restartBtn);
        }
        restartBtn.style.position = 'absolute';
        restartBtn.style.left = '50%';
        restartBtn.style.transform = 'translateX(-50%)';
        restartBtn.style.top = 'calc(35% + 240px)';
        restartBtn.style.width = '200px';
        restartBtn.style.height = '50px';
        restartBtn.style.background = '#ddd';
        restartBtn.style.border = '2px solid #aaa';
        restartBtn.style.textAlign = 'center';
        restartBtn.style.lineHeight = '50px';
        restartBtn.style.fontFamily = blockFontFamily;
        restartBtn.style.fontSize = '20px';
        restartBtn.style.cursor = 'pointer';
        restartBtn.style.zIndex = '5';
        restartBtn.innerText = 'Начать заново';
        restartBtn.style.display = 'block';

        // Add "or press Enter" below button
        let enterHint = document.getElementById('enterHint');
        if (!enterHint) {
            enterHint = document.createElement('div');
            enterHint.id = 'enterHint';
            document.body.appendChild(enterHint);
        }
        enterHint.style.position = 'absolute';
        enterHint.style.left = '50%';
        enterHint.style.transform = 'translateX(-50%)';
        enterHint.style.top = 'calc(35% + 295px)';
        enterHint.style.width = '200px';
        enterHint.style.textAlign = 'center';
        enterHint.style.fontFamily = blockFontFamily;
        enterHint.style.fontSize = '16px';
        enterHint.style.color = 'white';
        enterHint.style.zIndex = '5';
        enterHint.innerText = 'or press Enter';
        enterHint.style.display = 'block';

        // Continue loop to keep Game Over on screen
        requestAnimationFrame(draw);
        return;
    } else {
        // Hide restart button and payments and enterHint if present
        const restartBtn = document.getElementById('restartButton');
        if (restartBtn) restartBtn.style.display = 'none';
        const paymentsDiv = document.getElementById('paymentsDisplay');
        if (paymentsDiv) paymentsDiv.style.display = 'none';
        const enterHint = document.getElementById('enterHint');
        if (enterHint) enterHint.style.display = 'none';
        // Hide score, best, kill overlays during active game
        document.getElementById('scoreDisplay').style.display = 'none';
        document.getElementById('bestDisplay').style.display = 'none';
        document.getElementById('killDisplay').style.display = 'none';
        const paymentsDiv2 = document.getElementById('paymentsDisplay');
        if (paymentsDiv2) paymentsDiv2.style.display = 'none';
        // Hide summary display if present
        const summaryEl = document.getElementById('summaryDisplay');
        if (summaryEl) summaryEl.style.display = 'none';
        // Hide score and coin displays in the top left corner
        const scoreEl = document.getElementById('scoreDisplay');
        if (scoreEl) scoreEl.style.display = 'none';
        const coinDisplay = document.getElementById('coinDisplay');
        if (coinDisplay) coinDisplay.style.display = 'none';
    }

    // Draw first tile
    ctx.drawImage(bg, Math.round(bgX1), 0, canvas.width, canvas.height);
    // Draw mirrored second tile
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(bg, -Math.round(bgX2) - canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Рисуем остальные элементы игры
    obstacles.forEach(drawObstacle);
    coins.forEach(drawCoin);
    // Draw Valera sprites
    valeras.forEach(v => {
      if (valeraImg && valeraImg.complete) {
        ctx.save();
        ctx.translate(v.x + v.width / 2, v.y + v.height / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(valeraImg, -v.width / 2, -v.height / 2, v.width, v.height);
        ctx.restore();
      }
    });
    danyas.forEach(d => {
        if (danyaImg && danyaImg.complete) {
            ctx.save();
            ctx.translate(d.x + d.width / 2, d.y + d.height / 2);
            ctx.scale(1, 1); // Отменяем зеркалирование
            ctx.drawImage(danyaImg, -d.width / 2, -d.height / 2, d.width, d.height);
            ctx.restore();
        }
    });

    cortage.forEach(car => {
        if (car.img && car.img.complete) {
            ctx.save();
            if (car.flip) {
                ctx.translate(car.x + car.width, car.y);
                ctx.scale(-1, 1);
                ctx.drawImage(car.img, 0, 0, car.width, car.height);
            } else {
                ctx.translate(car.x, car.y);
                ctx.scale(1, 1);
                ctx.drawImage(car.img, 0, 0, car.width, car.height);
            }
            ctx.restore();
        }
    });

    cortage.forEach(car => {
        if (car.img && car.img.complete) {
            ctx.save();
            if (car.flip) {
                ctx.translate(car.x + car.width, car.y);
                ctx.scale(-1, 1);
                ctx.drawImage(car.img, 0, 0, car.width, car.height);
            } else {
                ctx.translate(car.x, car.y);
                ctx.scale(1, 1);
                ctx.drawImage(car.img, 0, 0, car.width, car.height);
            }
            ctx.restore();
        }
    });
    services.forEach(drawService);
    checks.forEach(drawCheck);
    inspectors.forEach(drawInspector);
    quadros.forEach(drawQuadro);
    if (runner) {
        drawRunner(runner);
    }

    // Draw popups on UI canvas
    popups.forEach((p, i) => {
        uiCtx.globalAlpha = p.alpha;
        uiCtx.fillStyle = p.color;
        uiCtx.font = '28px Arial';
        uiCtx.fillText(p.text, p.x, p.y);
        p.y -= 1;
        p.alpha -= 0.02;
        if (p.alpha <= 0) popups.splice(i,1);
    });
    uiCtx.globalAlpha = 1;

    drawUI();
    update();
    requestAnimationFrame(draw);  // Продолжаем рисовать
}
// Глобальные переменные для выплат, если не определены
if (typeof totalServicePaid === 'undefined') {
    window.totalServicePaid = 0;
}
if (typeof totalInspectorPaid === 'undefined') {
    window.totalInspectorPaid = 0;
}

document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем канвас после загрузки страницы
    window.canvas = document.getElementById('gameCanvas');  // Инициализируем canvas
    window.uiCanvas = document.getElementById('uiCanvas'); // Инициализируем второй канвас для UI

    if (canvas && uiCanvas) {
        ctx = canvas.getContext('2d');  // Получаем контекст для рисования на канвасе
        uiCtx = uiCanvas.getContext('2d');  // Контекст для UI

        // Disable pointer events on UI overlay so canvas can receive mouse events
        const uiOverlay = document.getElementById('uiOverlay');
        if (uiOverlay) {
          uiOverlay.style.pointerEvents = 'none';
        }
        // (Removed mouse position tracking event listeners)

        // Добавляем слушатели для первого взаимодействия пользователя (разрешение воспроизведения музыки)
        canvas.addEventListener('mousedown', () => {
            if (bgMusic && bgMusic.paused && allowMovement) {
                bgMusic.play().catch(() => {});
            }
        });
        canvas.addEventListener('touchstart', () => {
            if (bgMusic && bgMusic.paused && allowMovement) {
                bgMusic.play().catch(() => {});
            }
        });

        // Новый обработчик клика по HTML кнопке "Начать заново"
        document.addEventListener('click', function (e) {
            const restartBtn = document.getElementById('restartButton');
            if (restartBtn && restartBtn.style.display !== 'none') {
                // Проверяем, что клик по кнопке
                if (e.target === restartBtn) {
                    gameStarted = false;
                    isGameOver = false;
                    GameOver();
                    resetGame();
                    initGame();
                }
            }
        });

        // Также добавим обработчик на саму кнопку (на случай, если она появляется после DOMContentLoaded)
        document.addEventListener('DOMContentLoaded', function () {
            const restartBtn = document.getElementById('restartButton');
            if (restartBtn) {
                restartBtn.addEventListener('click', function () {
                    gameStarted = false;
                    isGameOver = false;
                    GameOver();
                    resetGame();
                    initGame();
                });
            }
        });

        // --- ДОБАВЛЕНО: обработка клика по стартовой кнопке ---
        const startBtn = document.getElementById('startButton');
        const startOverlay = document.getElementById('startOverlay');
        if (startBtn && startOverlay) {
            startBtn.addEventListener('click', () => {
                startOverlay.style.display = 'none';
                const loaderSound = document.getElementById('loaderSound');
                if (loaderSound) {
                    loaderSound.currentTime = 0;
                    loaderSound.volume = 0.5;
                    loaderSound.play().catch(() => {});
                }

                loadAssets(() => {
                    resetGame();
                    setupInput();
                    // Показываем загрузочный экран с анимацией прогресс-бара на 6 секунд
                    const overlay = document.getElementById('loaderOverlay');
                    const bar = document.getElementById('loaderBar');
                    const loaderDenisEl = document.getElementById('loaderCar');
                    const loadingText = document.getElementById('loaderText');
                    const duration = 6000;
                    const start = Date.now();

                    function tick() {
                        const t = Math.min((Date.now() - start) / duration, 1);
                        const percent = Math.floor(t * 100);
                        if (bar) bar.style.width = percent + '%';
                        if (loaderDenisEl) loaderDenisEl.style.left = `calc(${percent}% - 40px)`;
                        if (loadingText) loadingText.innerText = `Loading... ${percent}%`;

                        if (t < 1) {
                            requestAnimationFrame(tick);
                        } else {
                            if (overlay) overlay.style.display = 'none';

                            // Draw first frame of the game to show as background for countdown
                            draw();

                            const countdownEl = document.createElement('div');
                            countdownEl.id = 'countdown';
                            countdownEl.style.position = 'absolute';
                            countdownEl.style.top = '50%';
                            countdownEl.style.left = '50%';
                            countdownEl.style.transform = 'translate(-50%, -50%)';
                            countdownEl.style.fontSize = '96px';
                            countdownEl.style.color = 'white';
                            countdownEl.style.fontFamily = 'Arial';
                            countdownEl.style.zIndex = '20';
                            countdownEl.style.pointerEvents = 'none';
                            // Make sure no background color is set
                            // (If there was a line setting backgroundColor, it is removed)
                            document.getElementById('uiOverlay').appendChild(countdownEl);

                            const countdownSequence = ['READY', 'SET', 'GO'];
                            let countdownIndex = 0;
                            const countdownColors = ['red', 'orange', 'lime'];
                            countdownEl.innerText = countdownSequence[countdownIndex];
                            countdownEl.style.color = countdownColors[countdownIndex];
                            startSfx.currentTime = 0;
                            startSfx.play().catch(() => {});
                            const countdownInterval = setInterval(() => {
                                countdownIndex++;
                                if (countdownIndex < countdownSequence.length) {
                                    countdownEl.innerText = countdownSequence[countdownIndex];
                                    countdownEl.style.color = countdownColors[countdownIndex];
                                } else {
                                    clearInterval(countdownInterval);
                                    countdownEl.remove();

                                    if (bgMusic) {
                                        bgMusic.currentTime = 0;
                                        bgMusic.play().catch(() => {});
                                    }

                                    // Инициализация игры без запуска движения
                                    resetGame();
                                    draw();

                                    // Ждём пробел
                                    document.addEventListener('keydown', function waitForSpace(e) {
                                        if (e.code === 'Space') {
                                            allowMovement = true;
                                            gameStarted = true;
                                            setupInput(); // подключим управление
                                            initGame();   // старт основной логики
                                            draw();
                                            document.removeEventListener('keydown', waitForSpace);
                                        }
                                    });
                                }
                            }, 1000);
                        }
                    }
                    tick();
                });
            });
        }
        // --- КОНЕЦ ДОБАВЛЕНИЯ ---

        // УДАЛЕНО: вызов loadAssets(...) на старте, теперь загрузка только после клика по startButton
        // (БЫЛО)
        // loadAssets(() => {
        //     resetGame();
        //     setupInput();
        //     // ... загрузочный экран
        // });
    } else {
        console.error('Canvas не найден! Убедитесь, что элементы canvas с id "gameCanvas" и "uiCanvas" существуют.');
    }
});
// Export game state and reset logic for input.js

function spawnValera() {
    // Выравниваем Y с ямой и поднимаем на 10% высоты холста
    const pitSize = 75;
    const pitY = pitSpawnCenterY - pitSize / 2 - (canvas.height * 0.28);
    valeras.push({
        x: canvas.width,
        y: pitY - (canvas.height * 0.07),  // поднято на 10% высоты канваса
        width: runner.width,
        height: runner.height,
        audioPlayed: false
    });
}

function spawnDanya() {
    const pitSize = 75;
    const pitY = pitSpawnCenterY - pitSize / 2 - (canvas.height * 0.28);
    danyas.push({
        x: canvas.width,
        y: pitY - (canvas.height * 0.07),
        width: 160,
        height: 80,
        audioPlayed: false
    });
}
function spawnCortage() {
    const pitSize = 75;
    const pitY = pitSpawnCenterY - pitSize / 2 - (canvas.height * 0.28);
    const startX = canvas.width;
    const carWidth = 160;
    const carHeight = 80;
    const spacing = carWidth;

    cortageImgs.forEach((img, index) => {
        cortage.push({
            x: startX + index * (carWidth + spacing),
            y: pitY - (canvas.height * 0.07),
            width: carWidth,
            height: carHeight,
            img: img,
            audioPlayed: false,
            flip: true
        });
    });
}