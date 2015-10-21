'use strict';
(function() {

  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];

  var previewImage = resizeForm.querySelector('.resize-image-preview');
  var prevButton = resizeForm['resize-prev'];
  var resizeFieldX = resizeForm['resize-x'];
  var resizeFieldY = resizeForm['resize-y'];
  var resizeFieldSize = resizeForm['resize-size'];
  var isImageloaded = false;
  var imgW = 0;
  var imgH = 0;
  var maxSize = 0;
  var maxOffsetX = resizeFieldX.value || 0;
  var maxOffsetY = resizeFieldY.value || 0;



  function setupField(field, max, min) {
    var val = parseInt(field.value, 10) || 0;
    var minval = typeof min !== 'undefined' ? min : field.min || 0;
    if (val < minval) {
      field.value = minval;
    } else if (val > max) {
      field.value = max;
    }

    field.max = max;
    field.min = minval;

    return;
  }

  // fast test image
  // resizeForm.classList.remove('invisible');
  // uploadForm.classList.add('invisible');
  // previewImage.src = 'img/logo-background-2.jpg';

  previewImage.onload = function() {
    isImageloaded = true;
    imgW = this.offsetWidth;
    imgH = this.offsetHeight;
    maxSize = Math.min(imgW, imgH);
  };


  resizeFieldSize.onchange = function() {
    setupField(resizeFieldSize, maxSize, 1);
    var val = parseInt(this.value, 10);

    if (val) {
      maxOffsetX = imgW - val;
      maxOffsetY = imgH - val;
      setupField(resizeFieldX, maxOffsetX);
      setupField(resizeFieldY, maxOffsetY);
    }
  };

  resizeFieldX.onchange = function() {
    setupField(resizeFieldX, imgW - 1, 0);

    maxOffsetX = parseInt(this.value, 10) || 0;

    setupField(resizeFieldSize, Math.min(imgW - maxOffsetX, imgH - maxOffsetY));
  };

  resizeFieldY.onchange = function() {
    setupField(resizeFieldY, imgH - 1, 0);

    maxOffsetY = parseInt(this.value, 10) || 0;
    console.log(imgW - maxOffsetX, imgH - maxOffsetY);
    setupField(resizeFieldSize, Math.min(imgW - maxOffsetX, imgH - maxOffsetY));
  };


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
      console.log('Изображение недоступно');
      return;
    }

    if (!resizeFieldSize.value) {
      console.log('Сначала выберите кадрирование');
      return;
    }

    filterForm.elements['filter-image-src'] = previewImage.src;

    resizeForm.classList.add('invisible');
    filterForm.classList.remove('invisible');
  };
})();
