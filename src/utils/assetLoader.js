// src/utils/assetLoader.js
export async function loadAssets(onProgress) {
  // Глобальный импорт всех изображений и аудио
  const imageModules = import.meta.glob('../assets/*.{png,webp}', { eager: true, as: 'url' });
  const audioModules = import.meta.glob('../assets/*.mp3', { eager: true, as: 'url' });

  const assetEntries = [
    ...Object.entries(imageModules),  // [ ['./assets/bg_sky.png', '...url'], ... ]
    ...Object.entries(audioModules)
  ];

  const totalCount = assetEntries.length;
  let loadedCount = 0;

  const images = {};
  const audios = {};

  await Promise.all(assetEntries.map(async ([path, url]) => {
    if (url.endsWith('.png') || url.endsWith('.webp')) {
      const img = new Image();
      img.src = url;
      await img.decode();
      images[path.split('/').pop()] = img;
    } else if (url.endsWith('.mp3')) {
      const audio = new Audio(url);
      // Ждём готовности
      await new Promise(res => {
        audio.addEventListener('canplaythrough', res, { once: true });
      });
      audios[path.split('/').pop()] = audio;
    }
    loadedCount++;
    onProgress && onProgress(loadedCount / totalCount);
  }));

  return { images, audios };
}