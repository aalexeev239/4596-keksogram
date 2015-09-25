(function() {
  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];

  var previewImage = resizeForm.querySelector('.resize-image-preview'),
      prevButton = resizeForm['resize-prev'],
      resizeFieldX = resizeForm['resize-x'],
      resizeFieldY = resizeForm['resize-y'],
      resizeFieldSize = resizeForm['resize-size'],
      isImageloaded = false,
      imgW = 0,
      imgH = 0,
      maxSize = 0,
      maxOffsetX = resizeFieldX.value || 0,
      maxOffsetY = resizeFieldY.value || 0;



  var setupField = function(field, max, min) {
    var val = parseInt(field.value) || 0,
        min = typeof min !== 'undefined' ? min : field.min || 0;
    if (val < min) {
      field.value = min;
    } else if (val > max) {
      field.value = max;
    }

    field.max = max;
    field.min = min;

    return;
  }

  // fast test image
  // resizeForm.classList.remove('invisible');
  // uploadForm.classList.add('invisible');
  // previewImage.src = 'img/logo-background-2.jpg';

  previewImage.onload = function(ev) {
    isImageloaded = true;
    imgW = this.offsetWidth;
    imgH = this.offsetHeight;
    maxSize = Math.min(imgW, imgH);
  }


  resizeFieldSize.onchange = function(ev) {
    setupField(resizeFieldSize, maxSize, 1);
    var val = parseInt(this.value);

    if (val) {
      maxOffsetX = imgW - val;
      maxOffsetY = imgH - val;
      setupField(resizeFieldX, maxOffsetX);
      setupField(resizeFieldY, maxOffsetY);

    }

  }

  resizeFieldX.onchange = function(ev) {
    setupField(resizeFieldX, imgW - 1, 0);

    maxOffsetX = parseInt(this.value) || 0;

    setupField(resizeFieldSize, Math.min(imgW - maxOffsetX,imgH - maxOffsetY));
  }

  resizeFieldY.onchange = function(ev) {
    setupField(resizeFieldY, imgH - 1, 0);

    maxOffsetY = parseInt(this.value) || 0;
    console.log(imgW - maxOffsetX,imgH - maxOffsetY);
    setupField(resizeFieldSize, Math.min(imgW - maxOffsetX,imgH - maxOffsetY));
  }


  prevButton.onclick = function(evt) {
    evt.preventDefault();

    resizeForm.reset();
    uploadForm.reset();
    isImageloaded = false;
    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();

    if (!isImageloaded || !maxSize) {
      alert('Изображение недоступно');
      return;
    }

    if (!resizeFieldSize.value) {
      alert('Сначала выберите кадрирование');
      return;
    }

    filterForm.elements['filter-image-src'] = previewImage.src;

    resizeForm.classList.add('invisible');
    filterForm.classList.remove('invisible');
  };
})();
