// ---------- shareable now-playing card ----------
// Renders the current track into a downloadable PNG.

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  words.forEach((word) => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      ctx.fillText(line, x, curY);
      line = word + ' ';
      curY += lineHeight;
    } else {
      line = test;
    }
  });
  ctx.fillText(line, x, curY);
}

function drawShareCard(canvas, song) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1a1108');
  grad.addColorStop(1, '#0b0906');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(217,138,61,0.14)';
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.16, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#D98A3D';
  ctx.font = '600 34px "IBM Plex Mono", monospace';
  ctx.fillText('MERA RADIO', 64, 110);

  ctx.fillStyle = 'rgba(244,239,230,0.6)';
  ctx.font = '500 24px "IBM Plex Mono", monospace';
  ctx.fillText('NOW PLAYING', 64, 400);

  ctx.fillStyle = '#F4EFE6';
  ctx.font = '600 56px "Archivo Narrow", sans-serif';
  wrapText(ctx, song.title, 64, 470, w - 128, 62);

  ctx.fillStyle = 'rgba(244,239,230,0.72)';
  ctx.font = '400 28px "Archivo Narrow", sans-serif';
  ctx.fillText(song.film, 64, 620);
  ctx.fillText(song.singers, 64, 660);

  ctx.strokeStyle = 'rgba(244,239,230,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(64, h - 120);
  ctx.lineTo(w - 64, h - 120);
  ctx.stroke();

  ctx.fillStyle = 'rgba(244,239,230,0.55)';
  ctx.font = '500 20px "IBM Plex Mono", monospace';
  ctx.fillText('meraradio.app', 64, h - 70);
}

export function createShareCard({ buttonEl, canvasEl, getCurrentSong }) {
  buttonEl.addEventListener('click', () => {
    const song = getCurrentSong();
    if (!song) return;
    drawShareCard(canvasEl, song);
    const originalIcon = buttonEl.textContent;
    const originalTitle = buttonEl.title;

    canvasEl.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mera-radio-now-playing.png';
      a.click();
      URL.revokeObjectURL(url);
      buttonEl.textContent = '✓';
      buttonEl.title = 'saved';
      setTimeout(() => {
        buttonEl.textContent = originalIcon;
        buttonEl.title = originalTitle;
      }, 1400);
    }, 'image/png');
  });
}
