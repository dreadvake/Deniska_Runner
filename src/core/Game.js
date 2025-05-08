import { randomRange, rectsCollide } from '../utils/helpers.js';
import { setupInput } from '../managers/InputManager.js';
import { spawnObstacle, spawnCoin, spawnValera, spawnDanya, spawnCortage } from '../managers/SpawnerManager.js';
import { runner } from "../runner.js";
import EventBus from '../utils/EventBus.js';
import { loadAssets } from '../utils/assetLoader.js';
import { eventBus } from '../utils/EventBusInstance.js';
// Удалите строку: export const eventBus = new EventBus();

export default class Game {
  constructor({canvas, uiCanvas}) {
    this.canvas = canvas;
    this.uiCanvas = uiCanvas;
    this.ctx = canvas.getContext('2d');
    this.uiCtx = uiCanvas.getContext('2d');
    // Исправляем размер канваса для Retina-показа
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width  = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.uiCanvas.width  = this.canvas.width;
    this.uiCanvas.height = this.canvas.height;
    this.ctx.scale(dpr, dpr);
    this.uiCtx.scale(dpr, dpr);
    this.isGameOver = false;
    this.countdownActive = false;
    this.frameCount = 0;
    this.gameStarted = false;
    // Initialize other state variables as needed...
    this.allowMovement = true;
    this.speed = 0.005;
    this.distanceSinceLastValera = 0;
    this.distanceSinceLastDanya = 0;
    this.distanceSinceLastCortage = 0;
    this.nextCortageDistance = 15000;
    this.nextValeraDistance = 7500;
    this.nextDanyaDistance = 7500;
    this.distanceSinceLastPit = 0;
    this.distanceSinceLastSpawn = 0;
    this.minSpawnDistance = 300;
    this.minDistanceBetweenSpawns = 800;
    this.distanceTravelledPx = 0;
    this.lastMilestoneMeters = 0;
    this.lastCoinSpawnMeters = 0;
    // Removed old background X positions (bgX1, bgX2)
    // Parallax positions for sky and road
    this.skyX1 = 0;
    this.skyX2 = this.canvas.width;
    this.roadX1 = 0;
    this.roadX2 = this.canvas.width;
    this.gravity = 0.5;
    this.groundY = this.canvas.height - 100; // adjust as needed
    this.score = 0;
    this.coinCount = 0;
    this.kilometers = 0;

    // Entity collections
    this.valeras = [];
    this.danyas = [];
    this.cortage = [];
    this.obstacles = [];
    this.coins = [];
    this.inspectors = [];
    this.services = [];
    this.checks = [];
    this.quadros = [];

    // Initialize runner
    this.runner = {...runner};
    // Set initial runner position and physics
    this.runner.x = 100; // adjust starting X
    this.runner.y = this.groundY;
    this.runner.vy = 0;
    this.runner.width = this.runner.imgWidth; // or appropriate image width
    this.runner.height = this.runner.imgHeight; // or appropriate image height
    this.runner.tiltAngle = 0;
    this.runner.jumpStage = 0;
  }

  update() {
    if (!this.allowMovement) return;
    if (this.gameStarted) {
      // Spawn entities
      spawnObstacle(this);
      spawnCoin(this);
      this.speed += 0.00002;
      // -- Новый блок спавна Валеры, Дани, Кортежа --
      this.distanceSinceLastValera += this.speed;
      this.distanceSinceLastDanya += this.speed;
      this.distanceSinceLastCortage += this.speed;

      const noRacersOnScreen = this.valeras.length === 0 && this.danyas.length === 0 && this.cortage.length === 0;

      if (noRacersOnScreen) {
        if (this.distanceSinceLastCortage >= this.nextCortageDistance) {
          spawnCortage(this);
          this.distanceSinceLastCortage = 0;
          this.nextCortageDistance = randomRange(10000, 20000);
        } else if (this.distanceSinceLastValera >= this.nextValeraDistance) {
          spawnValera(this);
          this.distanceSinceLastValera = 0;
          this.nextValeraDistance = randomRange(5000, 10000);
        } else if (this.distanceSinceLastDanya >= this.nextDanyaDistance) {
          spawnDanya(this);
          this.distanceSinceLastDanya = 0;
          this.nextDanyaDistance = randomRange(5000, 10000);
        }
      }

      this.cortage.forEach((car, i) => {
        if (i === 0 && !car.audioPlayed && (car.x - this.runner.x) <= 500) {
          this.cortageSfx.currentTime = 0;
          this.cortageSfx.play().catch(() => {
          });
          car.audioPlayed = true;
        }
        car.x -= this.speed * 1.32;
      });

      if (this.cortage.length > 0 && this.cortage[this.cortage.length - 1].x + this.cortage[this.cortage.length - 1].width < 0) {
        this.cortage = [];
      }

      // Valera: move and collision
      this.valeras.forEach((v, i) => {
        v.x -= this.speed * 1.1;
        if (rectsCollide({
          x: this.runner.x,
          y: this.runner.y,
          width: this.runner.width,
          height: this.runner.height
        }, v)) {
          this.valeras.splice(i, 1);
          this.isGameOver = true;
          this.bgMusic?.pause();
          this.deathSfx?.play();
        }
      });
      this.valeras = this.valeras.filter(v => v.x + v.width > 0);

      // Danya: move and collision
      this.danyas.forEach((d, i) => {
        d.x -= this.speed * 1.2;
        if (rectsCollide({
          x: this.runner.x,
          y: this.runner.y,
          width: this.runner.width,
          height: this.runner.height
        }, d)) {
          this.danyas.splice(i, 1);
          this.score += 100;
          this.eventBus.emit('coinCollected', {value: 100});
          this.danyaSfx?.play();
        }
      });
      this.danyas = this.danyas.filter(d => d.x + d.width > 0);
    }

    // Accumulate distance traveled for spawn logic
    this.distanceSinceLastSpawn += 6;
    this.distanceTravelledPx += this.speed;
    const metersTravelled = this.distanceTravelledPx / (160 / 3);
    this.kilometers = metersTravelled / 1000;

    if (metersTravelled - this.lastMilestoneMeters >= 500) {
      this.coinCount += 50;
      this.lastMilestoneMeters += 500;
    }

    this.frameCount++;

    // Sky parallax (slower)
    this.skyX1 -= this.speed * 0.3;
    this.skyX2 -= this.speed * 0.3;
    if (this.skyX1 <= -this.canvas.width) this.skyX1 = this.skyX2 + this.canvas.width;
    if (this.skyX2 <= -this.canvas.width) this.skyX2 = this.skyX1 + this.canvas.width;

    // Road parallax (normal speed)
    this.roadX1 -= this.speed;
    this.roadX2 -= this.speed;
    if (this.roadX1 <= -this.canvas.width) this.roadX1 = this.roadX2 + this.canvas.width;
    if (this.roadX2 <= -this.canvas.width) this.roadX2 = this.roadX1 + this.canvas.width;

    // Gravity and runner physics
    this.runner.vy += this.gravity;
    this.runner.y += this.runner.vy;

    // Handle ground collision and tilt
    let targetAngleDeg = 0;
    if (this.runner.y >= this.groundY) {
      this.runner.y = this.groundY;
      this.runner.vy = 0;
      this.runner.onGround = true;
      this.runner.jumpStage = 0;
      targetAngleDeg = 0;
    } else {
      this.runner.onGround = false;
      if (this.runner.jumpStage === 1) {
        targetAngleDeg = -45;
        if (this.runner.vy >= 0) {
          this.runner.jumpStage = 2;
        }
      } else if (this.runner.jumpStage === 2) {
        targetAngleDeg = 0;
        if (this.runner.vy > 0) {
          this.runner.jumpStage = 3;
        }
      } else if (this.runner.jumpStage === 3) {
        targetAngleDeg = 45;
      }
    }
    this.runner.tiltAngle += (targetAngleDeg - this.runner.tiltAngle) * 0.1;

    // Obstacles: move and collision
    this.obstacles.forEach((o, i) => {
      o.x -= this.speed;
      const pitHitbox = {
        x: o.x + o.width / 2 - 2.5,
        y: o.y + o.height / 2 - 2.5,
        width: 5,
        height: 5
      };
      if (rectsCollide({
        x: this.runner.x,
        y: this.runner.y,
        width: this.runner.width,
        height: this.runner.height
      }, pitHitbox)) {
        this.isGameOver = true;
        this.audios['death_sfx.mp3']?.pause();
        this.audios['death_sfx.mp3'].currentTime = 0;
        this.audios['death_sfx.mp3'].play();
      }
    });
    this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);

    // Coins: move and collect
    this.coins.forEach((c, i) => {
      c.x -= this.speed;
      const runnerHitbox = {x: this.runner.x, y: this.runner.y, width: this.runner.width, height: this.runner.height};
      if (rectsCollide(runnerHitbox, c)) {
        this.score += 25;
        this.eventBus.emit('coinCollected', {value: 25});
        this.coins.splice(i, 1);
      }
    });
    this.coins = this.coins.filter(c => c.x + c.width > 0);

    // Inspectors: move, collision, payment or game over
    this.inspectors.forEach((ins, i) => {
      ins.x -= this.speed;
      const hitbox = {
        x: ins.x,
        y: ins.y + 15,
        width: ins.width,
        height: ins.height
      };
      if (rectsCollide({
        x: this.runner.x,
        y: this.runner.y,
        width: this.runner.width,
        height: this.runner.height
      }, hitbox)) {
        this.inspectors.splice(i, 1);
        if (this.score >= 50) {
          this.score -= 50;
          this.totalInspectorPaid = (this.totalInspectorPaid || 0) + 50;
          this.eventBus.emit('payment', {type: 'inspector', amount: 50});
          this.inspectorSfx?.play();
        } else {
          this.isGameOver = true;
          this.bgMusic?.pause();
          this.deathSfx?.play();
        }
      }
    });
    this.inspectors = this.inspectors.filter(ins => ins.x + ins.width > 0);

    // Services: move, collision, payment or game over
    this.services.forEach((svc, i) => {
      svc.x -= this.speed;
      const hitbox = {
        x: svc.x + (svc.hitboxOffsetX || 0),
        y: svc.y + (svc.height - (svc.hitboxHeight || svc.height)) / 2,
        width: svc.hitboxWidth || svc.width,
        height: svc.hitboxHeight || svc.height
      };
      if (rectsCollide({
        x: this.runner.x,
        y: this.runner.y,
        width: this.runner.width,
        height: this.runner.height
      }, hitbox)) {
        this.services.splice(i, 1);
        if (this.score >= 100) {
          this.score -= 100;
          this.totalServicePaid = (this.totalServicePaid || 0) + 100;
          this.eventBus.emit('payment', {type: 'service', amount: 100});
          this.serviceSfx?.play();
        } else {
          this.isGameOver = true;
          this.bgMusic?.pause();
          this.deathSfx?.play();
        }
      }
    });
    this.services = this.services.filter(svc => svc.x + svc.width > 0);

    // Check Engine: instant game over
    this.checks.forEach((ch, i) => {
      ch.x -= this.speed;
      const hitbox = {x: ch.x, y: ch.y, width: ch.width, height: ch.height};
      if (rectsCollide({
        x: this.runner.x,
        y: this.runner.y,
        width: this.runner.width,
        height: this.runner.height
      }, hitbox)) {
        this.checks.splice(i, 1);
        this.isGameOver = true;
        this.bgMusic?.pause();
        this.checkSfx?.play();
      }
    });
    this.checks = this.checks.filter(ch => ch.x + ch.width > 0);

    // Quadros: trigger fall and popup, then animate drop
    this.quadros.forEach((q, idx) => {
      if (!q.falling && rectsCollide({
        x: this.runner.x,
        y: this.runner.y,
        width: this.runner.width,
        height: this.runner.height
      }, {x: q.x - 10, y: q.y - 10, width: q.width + 20, height: q.height + 20})) {
        q.falling = true;
        const framesToFall = 0.3 * 60;
        q.vyFall = (this.groundY - q.y) / framesToFall;
        this.eventBus.emit('coinCollected', {value: 50});
      }
      if (q.falling) {
        q.y += q.vyFall;
      }
    });
    this.quadros = this.quadros.filter(q => q.y + q.height < this.groundY);
  }

  draw() {
    // Enable high-quality interpolation for scaled images
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.uiCtx.imageSmoothingEnabled = true;
    this.uiCtx.imageSmoothingQuality = 'high';
    // Fallback background fill to avoid black screen
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.isGameOver) {
      eventBus.emit('renderGameOver');
      return;
    }
    if (this.countdownActive) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
      // Only draw sky image as background during countdown
      this.ctx.drawImage(this.skyImg, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.denisImg, this.runner.x, this.runner.y, this.runner.width, this.runner.height);
      this.uiCtx.fillStyle = 'white';
      this.uiCtx.textAlign = 'center';
      this.uiCtx.font = '72px Arial';
      this.uiCtx.fillText(this.countdown, this.canvas.width / 2, this.canvas.height / 2);
      requestAnimationFrame(this.draw.bind(this));
      return;
    }
    // Normal play rendering
    this.canvas.style.filter = 'none';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
    this.ctx.textAlign = 'start';
    if (this.gameStarted) this.update();
    // Compute road and sky dimensions and positions
    // --- ROAD SCALING AND SHIFT ---
    const roadAspect = this.roadImg.height / this.roadImg.width;
    let roadDrawH = this.canvas.width * roadAspect;
    roadDrawH *= 0.9; // shrink height by 10%
    const bottomMargin = this.canvas.height - (this.canvas.height - roadDrawH);
    const additionalShift = bottomMargin * 0.1;
    const roadY = this.canvas.height - roadDrawH + additionalShift;

    // --- SKY SCALING UP TO ROAD ---
    const skyAspect = this.skyImg.height / this.skyImg.width;
    // Scale sky to full width, maintain aspect
    const skyDrawW = this.canvas.width;
    const skyDrawH = skyDrawW * skyAspect;
    // Align bottom of sky to top of road
    const skyY = roadY - skyDrawH;

    this.ctx.drawImage(
        this.skyImg,
        0, 0, this.skyImg.width, this.skyImg.height,
        this.skyX1, skyY, skyDrawW, skyDrawH
    );
    this.ctx.drawImage(
        this.skyImg,
        0, 0, this.skyImg.width, this.skyImg.height,
        this.skyX2, skyY, skyDrawW, skyDrawH
    );

    // Draw road with mirrored tiling for seamless repetition
    [this.roadX1, this.roadX2].forEach((xPos, idx) => {
      this.ctx.save();
      if (idx % 2 === 1) {
        // Mirrored tile
        this.ctx.translate(xPos + this.canvas.width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(
          this.roadImg,
          0, 0, this.roadImg.width, this.roadImg.height,
          0, roadY, this.canvas.width, roadDrawH
        );
      } else {
        // Normal tile
        this.ctx.drawImage(
          this.roadImg,
          0, 0, this.roadImg.width, this.roadImg.height,
          xPos, roadY, this.canvas.width, roadDrawH
        );
      }
      this.ctx.restore();
    });

    // Draw runner
    this.ctx.save();
    this.ctx.translate(this.runner.x + this.runner.width / 2, this.runner.y + this.runner.height / 2);
    this.ctx.rotate((this.runner.tiltAngle * Math.PI) / 180);
    this.ctx.drawImage(this.denisImg, -this.runner.width / 2, -this.runner.height / 2, this.runner.width, this.runner.height);
    this.ctx.restore();

    // Draw all game entities
    this.drawEntities();

    requestAnimationFrame(this.draw.bind(this));
  }

  async start() {
    // Load all assets before starting
    const loaderOverlay = document.getElementById('loaderOverlay');
    const loaderBar = document.getElementById('loaderBar');
    const loaderText = document.getElementById('loaderText');
    
    const {images, audios} = await loadAssets(progress => {
      const pct = Math.floor(progress * 100);
      if (loaderBar) loaderBar.style.width = `${pct}%`;
      if (loaderText) loaderText.innerText = `Loading... ${pct}%`;
    });
    
    this.images = images;
    this.audios = audios;
    this.denisImg = images['denis_runner.png'];
    this.skyImg = images['bg_sky.png'];
    this.roadImg = images['bg_road.png'];
    
    // Задайте высоту «земли» по высоте дороги:
    console.log(images);
    this.groundY = this.canvas.height - this.roadImg.height;
    
    // Assign SFX and music audio fields
    this.cortageSfx = audios['cortage.mp3'];
    this.valeraSfx = audios['valera.mp3'];
    this.danyaSfx = audios['danya.mp3'];
    this.serviceSfx = audios['service.mp3'];
    this.inspectorSfx = audios['inspector_sfx.mp3'];
    this.checkSfx = audios['Check_Sound.mp3'];
    this.deathSfx = audios['death_sfx.mp3'];
    this.bgMusic = audios['bgMusic.mp3'];

    if (loaderOverlay) loaderOverlay.style.display = 'none';

    this.gameStarted = true;
    setupInput(this);
    this.draw();
  }

  drawEntities() {
    const ctx = this.ctx;
    const drawArr = arr => arr.forEach(e => ctx.drawImage(e.img, e.x, e.y, e.width, e.height));
    drawArr(this.obstacles);
    drawArr(this.coins);
    drawArr(this.inspectors);
    drawArr(this.services);
    drawArr(this.checks);
    drawArr(this.quadros);
    drawArr(this.valeras);
    drawArr(this.danyas);
    drawArr(this.cortage);
  }
}