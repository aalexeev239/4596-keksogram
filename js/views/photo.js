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
   * template string
   * @type {string}
   */
  var templateString = document.getElementById('picture-template').textContent;


  /**
   * @constructor
   * @extends {Backbone.View}
   */
  var PhotoView = Backbone.View.extend({

    /**
     * @type {string}
     * @override
     */
    template: _.template(templateString),

    /**
     * @override
     */
    initialize: function() {
      this._onImageLoaded = this._onImageLoaded.bind(this);
      this._onImageFailed = this._onImageFailed.bind(this);
      this._onModelLike = this._onModelLike.bind(this);
      this._onClick = this._onClick.bind(this);

      this.model.on('change:liked', this._onModelLike);
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

      this.el.innerHTML = this.template(this.model.attributes);

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
     * click handler, check if like btn was pressed, otherwise trigger 'galleryclick' event
     * @param   {MouseEvent} ev
     * @private
     */
    _onClick: function(ev) {
      var target = ev.target;

      // if clicked on like toggle like and stop evaluating
      if (target.classList.contains('picture-likes')) {
        if (this.model.get('liked')) {
          this.model.dislike();
        } else {
          this.model.like();
        }
        return false;
      }

      // picture-likes
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
    },


    /**
     * update likes count
     * @private
     */
    _onModelLike: function() {
      var likeBtn = this.el.querySelector('.picture-likes');

      if (likeBtn) {
        var currentVal = parseInt(likeBtn.textContent, 10);
        likeBtn.textContent = this.model.get('liked') ? currentVal + 1 : currentVal - 1;
      }
    }
  });


  window.PhotoView = PhotoView;
})();
