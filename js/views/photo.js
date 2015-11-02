/* global Backbone: true */

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
   * @type {Element}
   */
  var template = document.getElementById('picture-template');

  /**
   * @constructor
   * @extends {Backbone.View}
   */
  var PhotoView = Backbone.View.extend({

    /**
     * @override
     */
    initialize: function() {
      this._onClick = this._onClick.bind(this);
    },
    /**
     * rendering tag
     * @type {Element}
     * @override
     */
    tagName: 'a',
    /**
     * rendering classname
     * @type {string}
     * @override
     */
    className: 'picture',


    /**
     * rendering
     * @override
     */
    render: function() {
      this._onImageLoaded = this._onImageLoaded.bind(this);
      this._onImageFailed = this._onImageFailed.bind(this);


      this.el.appendChild(template.content.cloneNode(true));
      this.el.querySelector('.picture-likes').textContent = this.model.get('likes');
      this.el.querySelector('.picture-comments').textContent = this.model.get('comments');
      this.el.querySelector('img');

      // _uploadPicture(this.model.get('url'), this.el.querySelector('img'));
      if (this.model.get('url')) {
        var img = new Image();

        img.addEventListener('load', this._onImageLoaded);
        img.addEventListener('error', this._onImageFailed);
        img.addEventListener('abort', this._onImageFailed);

        img.src = this.model.get('url');

        this._imageLoadTimeout = setTimeout((function() {
          this.el.classList.add('picture-load-failure');
        }).bind(this), REQUEST_FAILURE_TIMEOUT);
      }
    },


    /**
     * mapping events
     * @type {Object.<string, string>}
     */
    events: {
      'click': '_onClick'
    },


    /**
     * click handler, triggering 'galleryclick' event
     * @param   {MouseEvent} ev
     * @private
     */
    _onClick: function() {
      if (!this.el.classList.contains('picture-load-failure')) {
        this.trigger('galleryclick');
      }
    },


    /**
     * fires after image is loaded
     * @param   {Event} ev
     * @private
     */
    _onImageLoaded: function(ev) {
      clearTimeout(this._imageLoadTimeout);
      var img = ev.path[0];
      var currentImg = this.el.querySelector('img');
      this.el.classList.remove('picture-load-failure'); // if loaded after timeout is passed

      this._cleanupImageListeners(img);

      currentImg.parentNode.replaceChild(img, currentImg);
      img.style.width = PICTURE_SIZE;
      img.style.hight = PICTURE_SIZE;
    },


    /**
     * fires after image load is failed
     * @param   {Event} ev
     * @private
     */
    _onImageFailed: function(ev) {
      clearTimeout(this._imageLoadTimeout);
      var img = ev.path[0];
      this._cleanupImageListeners(img);
      this.el.classList.add('picture-load-failure');
    },


    /**
     * remove listeners from image
     * @param   {Image} img
     * @private
     */
    _cleanupImageListeners: function(img) {
      img.removeEventListener('load', this._onImageLoaded);
      img.removeEventListener('error', this._onImageFailed);
      img.removeEventListener('abort', this._onImageFailed);
    }
  });


  window.PhotoView = PhotoView;
})();
