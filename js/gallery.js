'use strict';

(function() {

  var overlayBlock = document.querySelector('.gallery-overlay');
  var closeBtn = document.querySelector('.gallery-overlay-close');


  var picturesBlock = document.querySelector('.pictures');

  var KEYCODE = {
    'ESC': 27,
    'LEFT': 37,
    'RIGHT': 39
  };


  // gallery controls
  function showGallery() {
    overlayBlock.classList.remove('invisible');

    // attach events
    closeBtn.addEventListener('click', hideGallery);
    document.addEventListener('keyup', onKeyUp);
  }


  function hideGallery() {
    overlayBlock.classList.add('invisible');

    // remove events
    closeBtn.removeEventListener('click', hideGallery);
    document.removeEventListener('keyup', onKeyUp);
  }


  function isGalleryHidden() {
    return overlayBlock.classList.contains('invisible');
  }

  // show gallery on picture click
  function onPictureClick(ev) {
    var el = ev.target;

    do {
      if (el.classList.contains('picture')) {
        ev.preventDefault();
        showGallery();
        break;
      }
      el = el.parentNode;
    } while (el);
  }


  function onKeyUp(ev) {

    if (isGalleryHidden()) {
      return;
    }

    switch (ev.keyCode) {

      case KEYCODE.ESC:
        hideGallery();
        break;

      case KEYCODE.LEFT:
        console.log('left!!!!111');
        break;

      case KEYCODE.RIGHT:
        console.log('right!!!!111');
        break;

      default:
        break;
    }
  }

  // attach listeners
  picturesBlock.addEventListener('click', onPictureClick);
})();
