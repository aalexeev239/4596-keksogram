'use strict';

(function() {

  /**
   * @const
   * @type {number}
   */
  var REQUEST_FAILURE_TIMEOUT = 10000;


  /**
   * @const
   * @type {number}
   */
  var PICTURE_SIZE = 182;


  /**
   * template to render
   * @type {[type]}
   */
  var template = document.getElementById('picture-template');


  /**
   * Photo constructor
   * @constructor
   * @param {Object} data
   */
  var Photo = function(data) {
    this._data = data;

    this._onClick = this._onClick.bind(this);
  };


  /**
   * Create DOM object, rendeк it and add listener
   * @param  {Element|DocumentFragment} container
   */
  Photo.prototype.render = function(container) {
    var newPhotoElement = template.content.children[0].cloneNode(true);
    var photoLikes = newPhotoElement.querySelector('.picture-likes');
    var photoComments = newPhotoElement.querySelector('.picture-comments');
    var photoPic = newPhotoElement.querySelector('img');

    var data = this._data;

    photoLikes.textContent = data.hasOwnProperty('likes') ? data.likes : 0;
    photoComments.textContent = data.hasOwnProperty('comments') ? data.comments : 0;

    container.appendChild(newPhotoElement);

    // loading image
    if (data.url) {
      var img = new Image();

      var imgLoadTimeout = setTimeout(function() {
        photoPic.classList.add('picture-load-failure');
      }, REQUEST_FAILURE_TIMEOUT);

      img.onload = function() {
        clearTimeout(imgLoadTimeout);
        photoPic.classList.remove('picture-load-failure');
        newPhotoElement.replaceChild(img, photoPic);
        img.style.width = PICTURE_SIZE;
        img.style.hight = PICTURE_SIZE;
      };

      img.onerror = function() {
        clearTimeout(imgLoadTimeout);
        photoPic.classList.add('picture-load-failure');
      };

      img.src = data.url;
    }

    this._element = newPhotoElement;
    this._element.addEventListener('click', this._onClick);
  };


  /**
   * remove item
   */
  Photo.prototype.unrender = function() {
    this._element.parentNode.removeChild(this._element);
    this._element.removeEventListener('click', this._onClick);
    this._element = null;
  };


  /**
   * show gallery on click
   * @private
   */
  Photo.prototype._onClick = function() {
    if (!this._element.classList.contains('picture-load-failure')) {
      var galleryEvent = new CustomEvent('showgallery', {detail: {photoElement: this } });
      window.dispatchEvent(galleryEvent);
    }
  };

  // exporting
  window.Photo = Photo;
})();
