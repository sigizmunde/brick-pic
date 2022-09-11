export function resizeImage(imageData, newWidth) {
  // 1. Count the amount of pixels in a block
  console.log('imageData = ', imageData);
  const oldWidth = imageData.width;
  const oldHeight = imageData.height;
  const blockWidth = Math.floor(oldWidth / newWidth) || 1;
  const newHeight = Math.floor(oldHeight / blockWidth);
  console.log('block width = ', blockWidth);
  console.log('new dimensions = ', newWidth, 'x', newHeight);
  // 2. Read block by coords
  const newData = new ImageData(newWidth, newHeight);
  const { data } = newData;
  for (let i = 0; i < newWidth; i += 1) {
    for (let j = 0; j < newHeight; j += 1) {
      const averageColor = [0, 0, 0, 0];
      for (let x = i * blockWidth; x < (i + 1) * blockWidth; x += 1) {
        for (let y = j * blockWidth; y < (j + 1) * blockWidth; y += 1) {
          const pixel = getPixelColors(x, y, imageData);
          // 3. Count average color of block}
          let component = 0;
          while (component < 4) {
            averageColor[component] += pixel[component] / blockWidth ** 2;
            component += 1;
          }
        }
      }
      let component = 0;
      while (component < 4) {
        data[i * 4 + j * newWidth * 4 + component] = Math.round(averageColor[component]);
        component += 1;
      }
    }
  }
  console.log(newData);
  // 4. Return image
  return newData;
}

function getPixelColors(x, y, imageData) {
  const coordR = y * (imageData.width * 4) + x * 4;
  const red = imageData.data[coordR];
  const green = imageData.data[coordR + 1];
  const blue = imageData.data[coordR + 2];
  const alpha = imageData.data[coordR + 3];
  return [red, green, blue, alpha];
}

export function grayscale({ data }) {
  for (let i = 0; i < data.length; i += 4) {
    const avg = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    const alpha = data[i + 3];
    const avgNonTransparent = (avg * alpha) / 255 + 255 - alpha;
    data[i] = avgNonTransparent; // red
    data[i + 1] = avgNonTransparent; // green
    data[i + 2] = avgNonTransparent; // blue
    data[i + 3] = 255; // alpha
  }
}

export function brightness({ data }, coef = 0) {
  console.log('brightness = ', coef);
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    let brightened = Math.round(avg + (avg * coef) / 10);
    brightened = brightened > 255 ? 255 : brightened;
    data[i] = brightened; // red
    data[i + 1] = brightened; // green
    data[i + 2] = brightened; // blue
  }
}

export function contrast({ data }, coef = 1) {
  const max = data.reduce((acc, val, idx) => ((idx + 1) % 4 ? (val > acc ? val : acc) : acc), 0);
  const min = data.reduce((acc, val, idx) => ((idx + 1) % 4 ? (val < acc ? val : acc) : acc), 255);
  const middle = (max - min) / 2 + min;
  console.log('min = ', min, ', max = ', max, ', middle = ', middle, ', coef = ', coef);
  if (min === max) return;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    let contr = Math.round(avg + (avg - middle) * coef);
    contr = contr > 255 ? 255 : contr < 0 ? 0 : contr;
    data[i] = contr; // red
    data[i + 1] = contr; // green
    data[i + 2] = contr; // blue
  }
}

export function autoContrast({ data }, coef = 1) {
  let max = data.reduce((acc, val, idx) => ((idx + 1) % 4 ? (val > acc ? val : acc) : acc), 0);
  let min = data.reduce((acc, val, idx) => ((idx + 1) % 4 ? (val < acc ? val : acc) : acc), 255);
  console.log('min = ', min, ', max = ', max, ', coef = ', coef);
  min = Math.round(min * coef);
  max = Math.round(255 - (255 - max) * coef);
  min = min > 47 ? 47 : min;
  max = max < 160 ? 160 : max;
  console.log('min = ', min, ', max = ', max);
  if (min === max || (min === 0 && max === 255)) return;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    let contr = Math.round((avg - min) * (255 / (max - min)));
    contr = contr > 255 ? 255 : contr;
    data[i] = contr; // red
    data[i + 1] = contr; // green
    data[i + 2] = contr; // blue
  }
}

export function levels({ data }, mapArray = [63, 127, 191, 255]) {
  for (let i = 0; i < data.length; i += 4) {
    const avg = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    let brickColor = 0;
    mapArray.forEach(el => {
      if (avg >= el - 16 && el > brickColor) brickColor = el;
    });
    data[i] = brickColor; // red
    data[i + 1] = brickColor; // green
    data[i + 2] = brickColor; // blue
  }
}

const defaultMappingTemplate = [
  { id: 0, border: 0, color: '#000000' },
  { id: 1, border: 47, color: '#2f2f2f' },
  { id: 2, border: 111, color: '#6f6f6f' },
  { id: 3, border: 175, color: '#afafaf' },
  { id: 4, border: 239, color: '#efefef' },
];

export function mapDataToBricks({ data, width }, mappingTemplate = defaultMappingTemplate) {
  const mappedData = { data: [], width, mapping: mappingTemplate }; // output format
  for (let i = 0; i * 4 < data.length; i += 1) {
    const avg = Math.round((data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 3);
    let brickIndex = 0;
    mappingTemplate.forEach(el => {
      if (avg >= el.border && el.id > brickIndex) brickIndex = el.id;
    });
    mappedData.data[i] = brickIndex;
  }
  return mappedData;
}

export function showBricks({ data, width, mapping }, canvas, brickSize = 16) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = width * brickSize;
  canvas.height = (data.length / width) * brickSize;
  data.map((val, idx) => {
    ctx.fillStyle = mapping.find(el => el.id === val)?.color || 0;
    const raw = idx % width;
    const column = Math.floor(idx / width);
    ctx.fillRect(raw * brickSize, column * brickSize, brickSize - 1, brickSize - 1);
  });
}
