/* global PhotoPreview:true */

'use strict';

(function() {

  /**
   * key mappings
   * @enum {number}
   */
  var Keycode = {
    'esc': 27,
    'left': 37,
    'right': 39
  };


  /**
   * @constructor
   */
  function Gallery() {
    // enforces new
    if (!(this instanceof Gallery)) {
      return new Gallery();
    }
    // constructor body
    this._photos = new Backbone.Collection();
    this._length = 0;
    this._currentPhoto = null;

    this._overlay = document.querySelector('.gallery-overlay');
    this._imageContainer = this._overlay.querySelector('.gallery-overlay-preview');
    this._closeBtn = this._overlay.querySelector('.gallery-overlay-close');

    this._onCloseClick = this._onCloseClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onPhotoClick = this._onPhotoClick.bind(this);
  }


  /**
   * show gallery, attach listeners
   */
  Gallery.prototype.show = function() {
    this._overlay.classList.remove('invisible');

    this._closeBtn.addEventListener('click', this._onCloseClick);
    this._imageContainer.addEventListener('click', this._onPhotoClick);
    document.addEventListener('keydown', this._onKeyDown);

    this._showCurrentPhoto();
  };


  /**
   * hide gallery, remove listeners
   */
  Gallery.prototype.hide = function() {
    this._overlay.classList.add('invisible');
    this._closeBtn.removeEventListener('click', this._onCloseClick);
    this._imageContainer.removeEventListener('click', this._onPhotoClick);
    document.removeEventListener('keydown', this._onKeyDown);
  };


  /**
   * go to next image. If image is not currently loaded, go to next
   * @private
   */
  Gallery.prototype._next = function() {
    var model;
    do {
      this._currentPhoto = this._currentPhoto < this._length - 1 ? this._currentPhoto + 1 : 0;
      model = this._photos.at(this._currentPhoto);
    } while (!model.get('imageLoaded'));

    this._showCurrentPhoto();
  };


  /**
   * go to prev image. If image is not currently loaded, go to prev
   * @private
   */
  Gallery.prototype._prev = function() {
    var model;
    do {
      this._currentPhoto = this._currentPhoto > 0 ? this._currentPhoto - 1 : this._length - 1;
      model = this._photos.at(this._currentPhoto);
    } while (!model.get('imageLoaded'));
    this._showCurrentPhoto();
  };


  /**
   * setting photos
   * @param {Array} photos
   */
  Gallery.prototype.setPhotos = function(photos) {
    this._photos = photos;
    this._length = photos.length;
  };


  /**
   * get current photos count
   * @return {number}
   */
  Gallery.prototype.getPhotosCount = function() {
    var len = this._photos ? this._photos.length : 0;

  };


  /**
   * check correct index & set current photo
   * @param {number} index
   */
  Gallery.prototype.setCurrentPhoto = function(index) {
    index = Math.min(Math.max(index, 0), this._photos.length - 1);

    if (this._currentPhoto === index) {
      return;
    }

    this._currentPhoto = index;
  };

  /**
   * go to next photo
   * @param {Event} ev
   * @private
   */
  Gallery.prototype._onPhotoClick = function(ev) {
    ev.preventDefault();
    this._next();
  };


  /**
   * showing photo
   * @private
   */
  Gallery.prototype._showCurrentPhoto = function() {
    this._imageContainer.innerHTML = '';

    var img = new PhotoPreview({ model: this._photos.at(this._currentPhoto)});
    img.render();
    this._imageContainer.appendChild(img.el);
  };





  /**
   * click on closing button. Calls hide
   * @param  {Event} ev
   */
  Gallery.prototype._onCloseClick = function(ev) {
    ev.preventDefault();
    this.hide();
  };

  /**
   * keyboard listeners - close on esc, move on arrows
   * @param   {Event} ev
   * @private
   */
  Gallery.prototype._onKeyDown = function(ev) {
    switch (ev.keyCode) {

      case Keycode.esc:
        this.hide();
        break;

      case Keycode.left:
        ev.preventDefault();
        this._prev();
        break;

      case Keycode.right:
        ev.preventDefault();
        this._next();
        break;

      default:
        break;
    }
  };




  window.Gallery = Gallery;

})();
