import { eventBus } from '../utils/EventBusInstance.js';


export default class UIManager {
  constructor() {
    this.bindEvents();
  }

  bindEvents() {
    // Game Over screen display
    eventBus.on('gameOver', ({ score, bestScore, totalServicePaid, totalInspectorPaid }) => {
      const gameOverEl = document.getElementById('gameOverScreen');
      if (gameOverEl) {
        gameOverEl.style.display = 'block';
        const goScore = document.getElementById('goScore');
        const goBest = document.getElementById('goBest');
        const goPayments = document.getElementById('goPayments');
        if (goScore) goScore.innerText = `Ваш счет: ${score}`;
        if (goBest) goBest.innerText = `BEST: ${bestScore}`;
        const lines = [];
        if (totalServicePaid > 0) lines.push(`В сервисе заплатили: <span style="color:red">-${totalServicePaid}</span>`);
        if (totalInspectorPaid > 0) lines.push(`Капустникам заплатили: <span style="color:red">-${totalInspectorPaid}</span>`);
        if (goPayments) goPayments.innerHTML = lines.join(' ');
      }
    });

    // Optional: handle renderGameOver if needed
    eventBus.on('renderGameOver', () => {
      // e.g., clear canvas or show animation
    });

    // Example: coin collection handler
    eventBus.on('coinCollected', ({ coin }) => {
      const scoreDisplay = document.getElementById('scoreDisplay');
      if (scoreDisplay) {
        scoreDisplay.innerText = `Score: ${coin.value}`;
      }
    });
  }
}
