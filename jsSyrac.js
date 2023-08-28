//SRT /////////////
//SRT  Section2  //
//SRT /////////////

//& /////////////////////////////
//&                           &//
//&         VARIABLES         &//
//&                           &//
//& /////////////////////////////

const filterForm = document.getElementById('filterForm');
const uploadInput = document.getElementById('uploadInput');
const image_preview = document.getElementById('image_preview');
const image_displayPreview = document.getElementById('image_displayPreview');
const instructions = document.getElementById('instructions'); // reefers to alert block

const valid_Pickers = ['grayscale', 'erosion', 'dilation'];

let picker = document.getElementById('r_option');
let uploadInput_validation = uploadInput;

let file_validation_boolean = new Boolean;

file_validation_boolean = null;

//& /////////////////////////////
//&                           &//
//&      EVENT LISTENERS      &//
//&                           &//
//& /////////////////////////////

uploadInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  const imageUrl =URL.createObjectURL(file);
  image_displayPreview.src = imageUrl;
});

uploadInput_validation.addEventListener('change', function() {
  uploadInput_validation = document.getElementById('uploadInput').files[0];
  file_validation(uploadInput_validation);
});

picker.addEventListener('change', function() {
  picker = document.getElementById('r_option').value;
  console.log(picker);
});

filterForm.addEventListener('submit', function(e) {
  e.preventDefault();
  if (file_validation_boolean && valid_Pickers.includes(picker)) {
    console.log('boss will activate');
    boss();
  } if (file_validation_boolean && !valid_Pickers.includes(picker)) {
    console.log('Please select picker');
  } if (file_validation_boolean !== true) {
    console.log('Please upload a file');
  } else {console.log('sth broke');}

});

//& /////////////////////////////
//&                           &//
//&         FUNCTIONS         &//
//&                           &//
//& /////////////////////////////

function boss() {
console.log('inside the boss function');

  const img = new Image();

  img.src = URL.createObjectURL(uploadInput.files[0]);
  img.onload = function() {
    console.log(picker);
    if (picker == 'grayscale') {
      const result = grayscale(img);
      image_preview.src = result;
    } else if (picker == 'erosion') {
      const result = erosion(img);
      image_preview.src = result;
    } else if (picker == 'dilation') {
      const result = dilation(img);
      image_preview.src = result;
    } else {console.log(picker);}
  };
};

function file_validation(uploadInput) {
  if (uploadInput.length !== 0) {

    const file_extension = uploadInput.name.split('.').pop().toLowerCase();
    const allowed_extensions = ['jpg', 'jpeg', 'png', 'ico'];

    console.log(file_extension, allowed_extensions);

    if (allowed_extensions.includes(file_extension)) {
      console.log('file extension approved:', file_extension);
      
      file_validation_boolean = true;
    } else {
      console.log('File extension is not allowed:', file_extension);
      return false;
    }

  } else if (uploadInput.length == 0) {
    console.log('File is not chosen');
    console.log('File submission will be prevented');
    return false;
  }
};

function grayscale(img) {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};

function erosion(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const structuringElementSize = 11; //! Set the structuring element size
  const halfSE = Math.floor(structuringElementSize / 2); // round down ex: -2.1 => -3
  const resultData = new Uint8ClampedArray(data.length);

  for (let y = halfSE; y < canvas.height - halfSE; y++) {
    for (let x = halfSE; x < canvas.width - halfSE; x++) {
      let minPixelValue = 255; // Initialize with maximum value

      for (let j = -halfSE; j <= halfSE; j++) {
        for (let i = -halfSE; i <= halfSE; i++) {
          const pixelIdx = ((y + j) * canvas.width + (x + i)) * 4;
          const pixelValue = data[pixelIdx]; // Grayscale value is the red channel

          if (pixelValue < minPixelValue) {
            minPixelValue = pixelValue;
          }
        }
      }

      const resultPixelIdx = (y * canvas.width + x) * 4;
      resultData[resultPixelIdx] = minPixelValue;
      resultData[resultPixelIdx + 1] = minPixelValue;
      resultData[resultPixelIdx + 2] = minPixelValue;
      resultData[resultPixelIdx + 3] = data[resultPixelIdx + 3];
    }
  }

  // Update the image
  for (let i = 0; i < data.length; i++) {
    data[i] = resultData[i];
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};



function dilation(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const structuringElementSize = 11; //! Set the structuring element size
  const halfSE = Math.floor(structuringElementSize / 2);
  const resultData = new Uint8ClampedArray(data.length);

  for (let y = halfSE; y < canvas.height - halfSE; y++) {
    for (let x = halfSE; x < canvas.width - halfSE; x++) {
      let maxPixelValue = 0; // Initialize with minimum value

      for (let j = -halfSE; j <= halfSE; j++) {
        for (let i = -halfSE; i <= halfSE; i++) {
          const pixelIdx = ((y + j) * canvas.width + (x + i)) * 4;
          const pixelValue = data[pixelIdx]; // Grayscale value is the red channel

          if (pixelValue > maxPixelValue) {
            maxPixelValue = pixelValue;
          }
        }
      }

      const resultPixelIdx = (y * canvas.width + x) * 4;
      resultData[resultPixelIdx] = maxPixelValue;
      resultData[resultPixelIdx + 1] = maxPixelValue;
      resultData[resultPixelIdx + 2] = maxPixelValue;
      resultData[resultPixelIdx + 3] = data[resultPixelIdx + 3];
    }
  }

  for (let i = 0; i < data.length; i++) {
    data[i] = resultData[i];
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};

//& /////////////////////////////
//&                           &//
//&           ALERTS          &//
//&                           &//
//& /////////////////////////////

//END /////////////
//END  Section2  //
//END /////////////

//SRT //////////////////////
//SRT  INSTRUCTION BUTTON //
//SRT //////////////////////

//END //////////////////////
//END  INSTRUCTION BUTTON //
//END //////////////////////