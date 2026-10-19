const { app, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(() => {
  const imgPath = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/.user_uploaded/media_1792323793442_d10fdc4a.png';
  const img = nativeImage.createFromPath(imgPath);
  const size = img.getSize();
  console.log('Image size:', size);

  // Crop modes section
  const cropRect = {
    x: Math.round(size.width * 0.44),
    y: Math.round(size.height * 0.54),
    width: Math.round(size.width * 0.22),
    height: Math.round(size.height * 0.40)
  };

  const cropped = img.crop(cropRect);
  const outPath = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/user_modes_zoomed.png';
  fs.writeFileSync(outPath, cropped.toPNG());
  console.log('Saved zoomed image to:', outPath);

  app.quit();
});
