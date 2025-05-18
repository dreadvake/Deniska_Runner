/* global isGameOver, frameCount, totalServicePaid, totalInspectorPaid, score, bestScore, countdown, countdownActive, ctx, uiCtx, gameCanvas, uiCanvas, bg, denisImg, gameStarted */
import { runner } from "./runner.js";

export function update() {
    if (isGameOver) return;
    frameCount++;
}

export function draw() {
    if (isGameOver) {
        // Show HTML Game Over overlay
        document.getElementById('gameOverScreen').style.display = 'block';
        document.getElementById('goScore').innerText = 'Ваш счет: ' + score;
        document.getElementById('goBest').innerText = 'BEST: ' + bestScore;
        // Build payments text with red coloring for amounts
        const lines = [];
        if (totalServicePaid > 0) lines.push('В сервисе заплатили: <span style="color:red">-' + totalServicePaid + '</span>');
        if (totalInspectorPaid > 0) lines.push('Капустникам заплатили: <span style="color:red">-' + totalInspectorPaid + '</span>');
        document.getElementById('goPayments').innerHTML = lines.join(' ');
        return;
    }
    if (countdownActive) {
        // draw current frame (background and runner at rest)
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
        // draw static background and runner without motion
        drawBackground();
        ctx.drawImage(denisImg, runner.x, runner.y, runner.width, runner.height);
        // draw countdown number
        uiCtx.fillStyle = 'white';
        uiCtx.textAlign = 'center';
        uiCtx.font = '72px Arial';
        uiCtx.fillText(countdown, gameCanvas.width/2, gameCanvas.height/2);
        requestAnimationFrame(draw);
        return;
    }
    // Now clear for normal play
    gameCanvas.style.filter = 'none';
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    ctx.textAlign = 'start';
    if (gameStarted) update();
    // Draw background, entities, popups и т.д.
    requestAnimationFrame(draw);
}