// Browser image processing helper (no backend).
// Uses an off-screen canvas + pixel manipulation to approximate the 10 medical presets.

export async function processImage(blob, preset = 'standard') {
  const bitmap = await createImageBitmap(blob);
  const width = bitmap.width;
  const height = bitmap.height;

  const off = new OffscreenCanvas(width, height);
  const ctx = off.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Helpers -------------------------------------------------------
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const applyBrightness = (val, delta) => clamp(val + delta);
  const applyContrast = (val, factor) => clamp((val - 128) * factor + 128);
  const applyGamma = (val, gamma) => clamp(255 * Math.pow(val / 255, 1 / gamma));

  // Convolution (3×3) helper
  const convolve3 = (kernel) => {
    const copy = new Uint8ClampedArray(data);
    const k = kernel;
    const idx = (x, y, c) => ((y * width) + x) * 4 + c;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          let ki = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              sum += copy[idx(x + kx, y + ky, c)] * k[ki++];
            }
          }
          data[idx(x, y, c)] = clamp(sum);
        }
      }
    }
  };

  // Median filter (3×3)
  const median3 = () => {
    const copy = new Uint8ClampedArray(data);
    const idx = (x, y, c) => ((y * width) + x) * 4 + c;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          const neighborhood = [];
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              neighborhood.push(copy[idx(x + kx, y + ky, c)]);
            }
          }
          neighborhood.sort((a, b) => a - b);
          data[idx(x, y, c)] = neighborhood[4];
        }
      }
    }
  };

  // Preset implementations ---------------------------------------
  const runPreset = {
    standard: () => {
      for (let i = 0; i < data.length; i += 4) {
        data[i]   = applyContrast(data[i], 1.2);
        data[i+1] = applyContrast(data[i+1], 1.2);
        data[i+2] = applyContrast(data[i+2], 1.2);
      }
      convolve3([0, -1, 0, -1, 5, -1, 0, -1, 0]); // light sharpen
    },
    mammography: () => {
      for (let i = 0; i < data.length; i += 4) {
        data[i]   = applyContrast(data[i], 1.5);
        data[i+1] = applyContrast(data[i+1], 1.5);
        data[i+2] = applyContrast(data[i+2], 1.5);
      }
      convolve3([-1, -1, -1, -1, 9, -1, -1, -1, -1]);
    },
    ophthalmology_red_free: () => {
      for (let i = 0; i < data.length; i += 4) {
        data[i]   = 25;               // suppress red
        data[i+2] = 25;               // suppress blue
        data[i+1] = clamp(data[i+1] * 1.8); // boost green
      }
    },
    radiology: () => {
      median3();
      for (let i = 0; i < data.length; i += 4) {
        data[i]   = applyContrast(data[i], 1.2);
        data[i+1] = applyContrast(data[i+1], 1.2);
        data[i+2] = applyContrast(data[i+2], 1.2);
      }
    },
    ct_soft_tissue: () => {
      for (let i = 0; i < data.length; i += 4) {
        data[i]   = applyGamma(data[i], 1.2);
        data[i+1] = applyGamma(data[i+1], 1.2);
        data[i+2] = applyGamma(data[i+2], 1.2);
      }
    },
    ct_lung: () => {
      for (let i = 0; i < data.length; i += 4) {
        data[i]   = applyGamma(data[i], 1.2);
        data[i+1] = applyGamma(data[i+1], 1.2);
        data[i+2] = applyGamma(data[i+2], 1.2);
      }
    },
    mri_t1: () => {
      convolve3([0, -1, 0, -1, 5, -1, 0, -1, 0]);
    },
    mri_t2: () => {
      for (let i = 0; i < data.length; i += 4) {
        data[i]   = applyContrast(data[i], 1.1);
        data[i+1] = applyContrast(data[i+1], 1.1);
        data[i+2] = applyContrast(data[i+2], 1.1);
      }
    },
    ultrasound: () => {
      median3();
      convolve3([0, -1, 0, -1, 5, -1, 0, -1, 0]);
    },
    endoscopy: () => {
      median3();
      for (let i = 0; i < data.length; i += 4) {
        data[i]   = applyContrast(applyBrightness(data[i], 10), 1.1);
        data[i+1] = applyContrast(applyBrightness(data[i+1], 10), 1.2);
        data[i+2] = applyContrast(applyBrightness(data[i+2], 10), 1.1);
      }
    }
  };

  if (!runPreset[preset]) throw new Error(`Unknown preset ${preset}`);
  runPreset[preset]();

  ctx.putImageData(imgData, 0, 0);
  const processedBlob = await off.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
  return processedBlob;
} 