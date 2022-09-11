import {
  resizeImage,
  brightness,
  contrast,
  grayscale,
  levels,
  mapDataToBricks,
  showBricks,
} from './imageprocessor';
import { showBrickStats } from './markupgenerator';

const options = {
  size: 25,
  brightness: 0,
  contrast: 0,
};

const ref = {};
ref.reader = new FileReader();
ref.image = new Image();

ref.imgInput = document.getElementById('imageInput');
ref.imgInput.addEventListener('change', handleImageInput);

ref.optionsForm = document.querySelector('#options');
ref.optionsForm
  .querySelectorAll('input')
  .forEach(el => el.addEventListener('change', handleOptionChange));

function handleOptionChange(e) {
  options[e.target.name] = parseInt(e.target.value);
  console.log(options);
  if (ref.imageData) {
    ref.resizedImageData = resizeImage(ref.imageData, options.size);
    processImage(ref.resizedImageData);
  }
}

function handleImageInput(e) {
  if (e.target.files) {
    const imageFile = e.target.files[0]; //here we get the image file
    ref.reader.readAsDataURL(imageFile);
    ref.reader.onloadend = function (e) {
      ref.image.src = e.target.result; // Assigns converted image to image object
      ref.image.onload = function (ev) {
        const virtualCanvas = document.createElement('canvas'); // Creates a canvas object
        const virtualContext = virtualCanvas.getContext('2d'); // Creates a contect object
        virtualCanvas.width = ref.image.width; // Assigns image's width to canvas
        virtualCanvas.height = ref.image.height; // Assigns image's height to canvas
        virtualContext.drawImage(ref.image, 0, 0); // Draws the image on canvas
        // let imgData = virtualCanvas.toDataURL('image/jpeg', 0.75); // Assigns image base64 string in jpeg format to a variable
        ref.imageData = virtualContext.getImageData(
          0,
          0,
          virtualCanvas.width,
          virtualCanvas.height,
        );
        ref.resizedImageData = resizeImage(ref.imageData, options.size);
        processImage(ref.resizedImageData);
      };
    };
  }
}

function processImage(imageData) {
  const newCanvas = document.getElementById('myCanvas');
  const newCanvasContext = newCanvas.getContext('2d');
  const { width, height } = imageData;
  newCanvas.width = imageData.width * 2;
  newCanvas.height = imageData.height * 2;
  newCanvasContext.putImageData(imageData, 0, 0);
  grayscale(imageData);
  newCanvasContext.putImageData(imageData, width, 0);
  brightness(imageData, options.brightness);
  contrast(imageData, options.contrast / 2);
  newCanvasContext.putImageData(imageData, 0, height);
  levels(imageData);
  newCanvasContext.putImageData(imageData, width, height);

  const brickCanvas = document.querySelector('#brickCanvas');
  const bricks = mapDataToBricks(imageData);
  showBricks(bricks, brickCanvas);

  showBrickStats(bricks, document.querySelector('#brickStats'));
}
