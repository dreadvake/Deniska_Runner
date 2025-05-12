import { runner } from './runner.js'; //
import { isGameOver, resetGame, GameOver } from '../main.js';

export function setupInput() {
    window.addEventListener('keydown', async (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            runner.vy = runner.jumpPower;
        }
        if (e.code === 'Enter' && isGameOver) {
            await GameOver();   // даём времени сохраниться счёту
            resetGame();
        }
    });

    window.addEventListener('touchstart', async () => {
        if (isGameOver) {
            await GameOver();
            resetGame();
        } else {
            runner.vy = runner.jumpPower;
        }
    });
}
