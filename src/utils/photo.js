export function resizeImage(file, maxSize = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Bild konnte nicht dekodiert werden'));
      img.onload = () => {
        let { width, height } = img;
        const longest = Math.max(width, height);
        if (longest > maxSize) {
          const ratio = maxSize / longest;
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export async function resizeMany(files, maxSize = 1400) {
  const out = [];
  for (const f of files) {
    try {
      out.push(await resizeImage(f, maxSize));
    } catch (e) {
      console.warn('Bild übersprungen:', e);
    }
  }
  return out;
}
