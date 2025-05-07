

import { eventBus } from '../core/Game';

export function setupInput(game) {
  // Space bar to jump
  window.addEventListener('keydown', e => {
    if (e.code === 'Space') {
      eventBus.emit('jump');
    }
    if (e.code === 'Enter') {
      eventBus.emit('restart');
    }
  });

  // Mouse click or touch to jump
  game.canvas.addEventListener('mousedown', () => {
    eventBus.emit('jump');
  });
  game.canvas.addEventListener('touchstart', () => {
    eventBus.emit('jump');
  });
}