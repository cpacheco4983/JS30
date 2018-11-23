// Feed video to player then place image to canvas every n amount of time
const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
// Strip is where we put the photos we've taken
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
  // This returns a promise
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      // Source needs to be a URL(Guess this is outdated)
      // URL.createObjectURL is deprecated so we are using HTMLMediaElement.srcObject
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch(err => {
      console.error('CAMERA ACCESS DENIED', err);
    });
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  // return this so we have access incase we need to stop painting
  // Not sure how this works...
  return setInterval(() => {
    // drawImage takes an image or video element and paints it to canvas
    // start at origin and got to width, height of canvas
    ctx.drawImage(video, 0, 0, width, height);

    // Take image pixels
    let pixels = ctx.getImageData(0, 0, width, height);
    
    // Manipulate them
    // pixels = redEffect(pixels);
    // pixels = rgbSplit(pixels);
    // pixels = greenScreen(pixels);

    // Plave them back on canvas
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function takePhoto() {
  snap.currentTime = 0;
  snap.play();

  // The canvas returns a base64 representatino of the image
  // Can be set to jpeg, png, jpg, etc. Can set img quality with jpegs. 1 = high .1 = low
  const data = canvas.toDataURL('image/jpeg', 1.0);
  const link = document.createElement('a');
  link.href = data;
  // Allows image to be downloaded with name 'handsome'
  link.setAttribute('download', 'handsome');
  // Shows small version of img
  link.innerHTML = `<img src="${data}" alt="Handsome Man" />`;
  // Add img to img strip element
  strip.insertBefore(link, strip.firstChild);
}

// Manipulate RGB values to show more red
function redEffect(pixels) {
  for(let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] * 1.50; // RED
    pixels.data[i + 1] = pixels.data[i + 1] * 0.75; // GREEN
    pixels.data[i + 2] = pixels.data[i + 2] * 0.50; // BLUE
  }
  return pixels;
}

// Pulls each pixel RGB value and moves them to the left and right
function rgbSplit(pixels) {
  for(let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i + 0]; // RED
    pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
    pixels.data[i - 550] = pixels.data[i + 2]; // BLUE
  }
  return pixels;
}

// Take out colors in between the slider values
function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i += 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    // alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && red <= levels.rmax
      && green >= levels.gmin
      && green <= levels.gmax
      && blue >= levels.bmin
      && blue <= levels.bmax) {
      // take it out! Sets transparency to 0
      pixels.data[i + 3] = 0; // Using alpha = 0 doesnt work
    }
  }

  return pixels;
}

getVideo();

// Once the video is playing we call paint
video.addEventListener('canplay', paintToCanvas);
