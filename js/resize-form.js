'use strict';

(function() {
  var THROTTLE = 10;

  /**
   * key mappings
   * @enum {number}
   */
  var Keycode = {
    'up': 38,
    'down': 40
  };


  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];

  var previewImage = resizeForm.querySelector('.resize-image-preview');
  var prevButton = resizeForm['resize-prev'];

  var resizeX = document.getElementById('resize-x');
  var resizeY = document.getElementById('resize-y');
  var resizeSide = document.getElementById('resize-size');

  var currentValue = {
    x: 0,
    y: 0,
    size: 1
  };

  resizeX.addEventListener('keydown', shiftBoost);
  resizeY.addEventListener('keydown', shiftBoost);
  resizeSide.addEventListener('keydown', shiftBoost);

  function shiftBoost(ev) {
    var key = window.event.keyCode;
    var isShift = !!window.event.shiftKey;

    if (key !== Keycode.up && key !== Keycode.down && !isShift) {
      return;
    }

    var target = ev.target;
    var val = parseInt(target.value) || 0;

    if (key === Keycode.up) {
      target.value = val + 9;
    }

    if (key === Keycode.down) {
      target.value = val - 9;
    }
  }


  resizeX.addEventListener('input', function() {
    currentValue.x = parseInt(resizeX.value) || 0;

    var normValue = normalize(currentValue);
    if (normValue) {
      setCurrentValue(normValue);
    }

    resizer.setConstraint(currentValue.x, currentValue.y, currentValue.side);
  });


  resizeY.addEventListener('input', function() {
    currentValue.y = parseInt(resizeY.value) || 0;

    var normValue = normalize(currentValue);
    if (normValue) {
      setCurrentValue(normValue);
    }

    resizer.setConstraint(currentValue.x, currentValue.y, currentValue.side);
  });


  resizeSide.addEventListener('input', function() {
    var newValue = parseInt(resizeSide.value) || 0;
    newValue = Math.max(1, Math.min(newValue, resizer.size.width, resizer.size.height))
    var diff = currentValue.side - newValue;
    if (diff === 0) {
      resizeSide.value = newValue;
      return;
    }
    currentValue.side = newValue;
    currentValue.x += diff/2;
    currentValue.y += diff/2;

    var normValue = normalize(currentValue);
    if (normValue) {
      setCurrentValue(normValue);
    }

    resizer.setConstraint(currentValue.x, currentValue.y, currentValue.side);
  });


  var timer;

  prevButton.onclick = function(evt) {
    evt.preventDefault();

    resizeForm.reset();
    uploadForm.reset();
    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();
    filterForm.elements['filter-image-src'] = previewImage.src;

    resizeForm.classList.add('invisible');
    filterForm.classList.remove('invisible');
  };


  window.addEventListener('resizerchange', function() {
    clearTimeout(timer)
    timer = setTimeout(function() {
      var currentConstraint = resizer.getConstraint();
      var normConstraint = normalize(currentConstraint);
      if (normConstraint) {
        resizer.setConstraint(normConstraint.x, normConstraint.y, normConstraint.side);
      } else {
        setCurrentValue(currentConstraint);
      }
    }, THROTTLE);
  });

  function normalize(val) {
    var flag = false;

    if (val.side < 1) {
      val.side = 1;
      flag = true;
    }

    if (val.side > Math.min(resizer.size.width, resizer.size.height)) {
      val.side = Math.min(resizer.size.width, resizer.size.height);
      flag = true;
    }

    if (val.x < 0) {
      val.x = 0;
      flag = true;
    }

    if (val.x + val.side > resizer.size.width) {
      val.x = resizer.size.width - val.side;
      flag = true;
    }

    if (val.y < 0) {
      val.y = 0;
      flag = true;
    }

    if (val.y + val.side > resizer.size.height) {
      val.y = resizer.size.height - val.side;
      flag = true;
    }

    if (flag) {
      return val;
    } else {
      return false;
    }
  }


  function setCurrentValue(val) {
    resizeX.value = Math.ceil(currentValue.x = val.x);
    resizeY.value = Math.ceil(currentValue.y = val.y);
    resizeSide.value = Math.ceil(currentValue.side = val.side);
  }

})();
