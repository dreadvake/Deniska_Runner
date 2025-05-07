

// src/managers/SpawnerManager.js
/**
 * Each spawn function receives the game instance (`game`)
 * and pushes a new entity into the appropriate array.
 */

export function spawnObstacle(game) {
  const img = game.images['pothole.png'];
  const width = img.width;
  const height = img.height;
  game.obstacles.push({
    img,
    x: game.canvas.width,
    y: game.groundY,
    width,
    height
  });
}

export function spawnCoin(game) {
  const img = game.images['coin.png'];
  const width = img.width;
  const height = img.height;
  game.coins.push({
    img,
    x: game.canvas.width,
    y: game.groundY - 50, // adjust coin height as needed
    width,
    height
  });
}

export function spawnValera(game) {
  const img = game.images['Valera_runner.png'];
  const width = img.width;
  const height = img.height;
  game.valeras.push({
    img,
    x: game.canvas.width,
    y: game.groundY,
    width,
    height
  });
}

export function spawnDanya(game) {
  const img = game.images['danya.png'];
  const width = img.width;
  const height = img.height;
  game.danyas.push({
    img,
    x: game.canvas.width,
    y: game.groundY,
    width,
    height
  });
}

export function spawnCortage(game) {
  const img = game.images['Cortage1.png']; // You may choose the correct index or randomize among Cortage images
  const width = img.width;
  const height = img.height;
  game.cortage.push({
    img,
    x: game.canvas.width,
    y: game.groundY - height,
    width,
    height,
    audioPlayed: false
  });
}