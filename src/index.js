import Game from './core/Game';
import UIManager from './managers/UIManager';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const uiCanvas = document.getElementById('uiCanvas');
  if (!canvas || !uiCanvas) {
    console.error('Canvas elements not found. Ensure <canvas id="gameCanvas"> and <canvas id="uiCanvas"> exist.');
    return;
  }

  // Initialize game and UI manager
  const game = new Game({ canvas, uiCanvas });
  const uiManager = new UIManager();

  const startOverlay = document.getElementById('startOverlay');
  const startButton  = document.getElementById('startButton');

  const loaderOverlay = document.getElementById('loaderOverlay');
  const loaderBar     = document.getElementById('loaderBar');
  const loaderText    = document.getElementById('loaderText');

  function startGame() {
    if (startOverlay) startOverlay.style.display = 'none';
    if (loaderOverlay) loaderOverlay.style.display = 'flex';
    game.start();
  }

  if (startButton) {
    startButton.addEventListener('click', startGame);
  }
  window.addEventListener('keydown', e => {
    if (e.code === 'Enter') startGame();
  });
});