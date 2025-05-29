const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  const canvas = createCanvas(1024, 500);
  const ctx = canvas.getContext('2d');

      
  // Load background
  const bgPath = path.resolve(process.cwd(), 'src/assets/motion.jpg');
  const background = await loadImage(bgPath);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Background solid color
      ctx.fillStyle = '#080807'; // Dark grey
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;

      // Title
      ctx.fillStyle = '#07c1f5';
      ctx.font = 'bold 50px sans-serif';
      ctx.fillText(`Selamat Datang di
MOTIONLIFE ROLEPLAY`, 360, 80);

      // Username
      ctx.font = '38px sans-serif';
      ctx.fillText(`@`, 360, 200);

      // Member Count
      ctx.font = '28px sans-serif';
      ctx.fillText(`Kamu member ke`, 360, 250);
  
  // Output image
  res.set('Content-Type', 'image/png');
  res.send(canvas.toBuffer('image/png'));
});

app.listen(port, () => {
  console.log(`🖼️ Preview at http://localhost:${port}`);
});