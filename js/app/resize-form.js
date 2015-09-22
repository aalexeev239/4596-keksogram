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
      offsetX = resizeFieldX.value || 0,
      offsetY = resizeFieldY.value || 0;



  previewImage.onload = function(ev) {
    console.log('load');
    isImageloaded = true;
    imgW = this.offsetWidth;
    imgH = this.offsetHeight;
    maxSize = Math.min(imgW, imgH);

    resizeFieldX.min = 0;
    resizeFieldY.min = 0;
    resizeFieldSize.min = 0;
    resizeFieldX.max = imgW;
    resizeFieldY.max = imgH;
    resizeFieldSize.max = maxSize;
  }


  resizeFieldSize.onchange = function(ev) {
    var val = parseInt(this.value);
    this.max = maxSize;
    if (isNaN(val) || val < 0) {
      val = 0;
    } else {
      val = Math.min(val, maxSize);
    }
    // this.value = val;

    resizeFieldX.max = (imgW - val);
    resizeFieldY.max = (imgH - val);
  }

  // resizeFieldX.onchange = function(ev) {
  //   var val = parseInt(this.value);
  //   this.max = imgW - 1;
  //   if (isNaN(val) || val < 0) {
  //     val = 0;
  //   } else {
  //     val = Math.min(val, imgW - 1);
  //   }
  //   offsetX = val;
  //   resizeFieldSize.max = Math.min(imgW - offsetX,imgH - offsetY);
  //   this.value = val;
  // }

  // resizeFieldY.onchange = function(ev) {
  //   var val = parseInt(this.value);
  //   this.max = imgH - 1;
  //   if (isNaN(val) || val < 0) {
  //     val = 0;
  //   } else {
  //     val = Math.min(val, imgH - 1);
  //   }
  //   offsetY = val;
  //   resizeFieldSize.max = Math.min(imgW - offsetX,imgH - offsetY);
  //   this.value = val;
  // }


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
