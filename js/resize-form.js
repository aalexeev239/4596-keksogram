/* global resizer: true */

'use strict';

(function() {


  /**
   * Throttle resizer handler
   * @type {number}
   */
  var THROTTLE = 10;


  /**
   * timer for throttling
   */
  var timer;


  /**
   * key mappings
   * @enum {number}
   */
  var Keycode = {
    'UP': 38,
    'DOWN': 40
  };


  /**
   * @type {Element}
   */
  var uploadForm = document.forms['upload-select-image'];


  /**
   * @type {Element}
   */
  var resizeForm = document.forms['upload-resize'];


  /**
   * @type {Element}
   */
  var filterForm = document.forms['upload-filter'];


  /**
   * @type {Element}
   */
  var previewImage = resizeForm.querySelector('.resize-image-preview');


  /**
   * @type {Element}
   */
  var prevButton = resizeForm['resize-prev'];


  /**
   * resize controls
   * @type {Element}
   */
  var resizeX = document.getElementById('resize-x');


  /**
   * resize controls
   * @type {Element}
   */
  var resizeY = document.getElementById('resize-y');


  /**
   * resize controls
   * @type {Element}
   */
  var resizeSide = document.getElementById('resize-size');


  /**
   * helper containing current controls values
   * @enum {number}
   */
  var _currentValue = {
    x: 0,
    y: 0,
    size: 1
  };



  /**
   * detect if shift key was pressed
   * and increase/decrease control value by 10
   * @param   {Event} ev
   * @return  {[type]}
   * @private
   */
  function _shiftBoost(ev) {
    var key = window.event.keyCode;
    var isShift = !!window.event.shiftKey;

    if (key !== Keycode.UP && key !== Keycode.DOWN) {
      return;
    }

    var target = ev.target;
    var val = parseInt(target.value) || 0;

    if (key === Keycode.UP && isShift) {
      target.value = val + 9;
    }

    if (key === Keycode.DOWN && isShift) {
      target.value = val - 9;
    }
  }


  /**
   * set correct values of resizeX or resizeY and apply them to resizer
   * @private
   */
  function _onResizeOffsetChanged() {
    _currentValue.x = parseInt(resizeX.value, 10) || 0;
    _currentValue.y = parseInt(resizeY.value, 10) || 0;

    var normValue = _normalize(_currentValue);
    if (normValue) {
      _setCurrentValue(normValue);
    }
    resizer.setConstraint(_currentValue.x, _currentValue.y, _currentValue.side);
  }


  /**
   * set correct values of all controls when side controls changes and apply them to resizer
   * @private
   */
  function _onResizeSideChanged() {
    var newValue = parseInt(resizeSide.value, 10) || 0;
    // 1 ≤ newVAlue ≤ (width, height)
    newValue = Math.max(1, Math.min(newValue, resizer.size.width, resizer.size.height));

    // if value haven't changed just set the correct to control, otherwise move the resizer
    var diff = _currentValue.side - newValue;
    if (diff === 0) {
      resizeSide.value = newValue;
      return;
    }

    _currentValue.side = newValue;
    _currentValue.x += diff / 2;
    _currentValue.y += diff / 2;

    var normValue = _normalize(_currentValue);
    if (normValue) {
      _setCurrentValue(normValue);
    }

    resizer.setConstraint(_currentValue.x, _currentValue.y, _currentValue.side);
  }


  /**
   * normalize both values from controls and resizer
   * returns false uf value is good
   * returns corrected value if value is bed
   * @param   {@enum} val
   * @return  {(@enum|boolean)}
   * @private
   */
  function _normalize(val) {
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


  /**
   * set _currentValue to form controls
   * @param   {@enum} val
   * @private
   */
  function _setCurrentValue(val) {
    _currentValue.x = val.x;
    _currentValue.y = val.y;
    _currentValue.side = val.side;
    resizeX.value = Math.ceil(_currentValue.x);
    resizeY.value = Math.ceil(_currentValue.y);
    resizeSide.value = Math.ceil(_currentValue.side);
  }


  // attach listeners
  resizeX.addEventListener('keydown', _shiftBoost);
  resizeY.addEventListener('keydown', _shiftBoost);
  resizeSide.addEventListener('keydown', _shiftBoost);
  resizeX.addEventListener('change', _onResizeOffsetChanged);
  resizeY.addEventListener('change', _onResizeOffsetChanged);
  resizeSide.addEventListener('change', _onResizeSideChanged);


  prevButton.onclick = function(evt) {
    evt.preventDefault();

    resizeForm.reset();
    uploadForm.reset();
    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();
    var res = resizer.exportImage();
    filterForm.elements['filter-image-src'].value = res.src;
    previewImage.src = res.src;

    resizeForm.classList.add('invisible');
    filterForm.classList.remove('invisible');
  };


  window.addEventListener('resizerchange', function() {
    clearTimeout(timer);
    timer = setTimeout(function() {
      var currentConstraint = resizer.getConstraint();
      var normConstraint = _normalize(currentConstraint);
      if (normConstraint) {
        resizer.setConstraint(normConstraint.x, normConstraint.y, normConstraint.side);
      } else {
        _setCurrentValue(currentConstraint);
      }
    }, THROTTLE);
  });
})();
