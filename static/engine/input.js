import { runner } from './runner.js'; //
import { isGameOver, resetGame } from '../main.js';

export function setupInput() {
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            runner.vy = runner.jumpPower;
        }
        if (e.code === 'Enter' && isGameOver) {
            resetGame();
        }
    });

    window.addEventListener('touchstart', () => {
        if (isGameOver) {
            resetGame();
        } else {
            runner.vy = runner.jumpPower;
        }
    });
}