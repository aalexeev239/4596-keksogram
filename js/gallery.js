/* global PhotoPreview:true */

'use strict';

(function() {

  /**
   * key mappings
   * @enum {number}
   */
  var Keycode = {
    'ESC': 27,
    'LEFT': 37,
    'RIGHT': 39
  };


  /**
   * @constructor
   */
  function Gallery() {
    this._photos = new Backbone.Collection();
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
    // this._imageContainer.addEventListener('click', this._onPhotoClick);
    document.addEventListener('keydown', this._onKeyDown);

    this._showCurrentPhoto();
  };


  /**
   * hide gallery, remove listeners
   */
  Gallery.prototype.hide = function() {
    this._overlay.classList.add('invisible');
    this._closeBtn.removeEventListener('click', this._onCloseClick);
    // this._imageContainer.removeEventListener('click', this._onPhotoClick);
    document.removeEventListener('keydown', this._onKeyDown);
  };


  /**
   * go to next image. If image is not currently loaded, go to next
   * @private
   */
  Gallery.prototype._next = function() {
    this._currentPhoto = this._currentPhoto < this._photos.length - 1 ? this._currentPhoto + 1 : 0;
    this._showCurrentPhoto();
  };


  /**
   * go to prev image. If image is not currently loaded, go to prev
   * @private
   */
  Gallery.prototype._prev = function() {
    this._currentPhoto = this._currentPhoto > 0 ? this._currentPhoto - 1 : this._photos.length - 1;
    this._showCurrentPhoto();
  };


  /**
   * setting photos
   * @param {Array} photos
   */
  Gallery.prototype.setPhotos = function(photos) {
    this._photos = photos;
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
    this._next();
  };


  /**
   * showing photo
   * @private
   */
  Gallery.prototype._showCurrentPhoto = function() {
    // this._imageContainer.removeEventListener('click', this._onPhotoClick);

    var preview = new PhotoPreview({ model: this._photos.at(this._currentPhoto)});
    preview.setElement(this._imageContainer);
    preview.render();
    preview.once('gallery.photoclick', this._onPhotoClick);



    // this._imageContainer.parentNode.replaceChild(preview.el, this._imageContainer);
    // this._imageContainer = preview.el;
    // this._imageContainer.addEventListener('click', this._onPhotoClick);
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

      case Keycode.ESC:
        this.hide();
        break;

      case Keycode.LEFT:
        ev.preventDefault();
        this._prev();
        break;

      case Keycode.RIGHT:
        ev.preventDefault();
        this._next();
        break;

      default:
        break;
    }
  };




  window.Gallery = Gallery;

})();
