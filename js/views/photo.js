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
   * @type {[type]}
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
      this.el.appendChild(template.content.cloneNode(true));
      this.el.querySelector('.picture-likes').textContent = this.model.get('likes');
      this.el.querySelector('.picture-comments').textContent = this.model.get('comments');
      this.el.querySelector('img');
      _uploadPicture(this.model.get('url'), this.el.querySelector('img'));
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
      if (!this.el.querySelector('.picture-load-failure')) {
        this.trigger('galleryclick');
      }
    }
  });



  /**
   * uploading Picture Helper
   * @param   {string} url
   * @param   {Element} node
   * @private
   */
  function _uploadPicture(url, node) {
    var img = new Image();
    var timer;

    function _loadSuccess() {
      clearTimeout(timer);
      node.parentNode.replaceChild(img, node);
      img.style.width = PICTURE_SIZE;
      img.style.hight = PICTURE_SIZE;
      _removeListeners();
    }

    function _loadError() {
      clearTimeout(timer);
      node.classList.add('picture-load-failure');
      _removeListeners();
    }


    function _removeListeners() {
      img.removeEventListener('load', _loadSuccess);
      img.removeEventListener('error', _loadError);
      img.removeEventListener('abort', _loadError);
    }



    timer = setTimeout(function() {
      _loadError();
    }, REQUEST_FAILURE_TIMEOUT);

    img.addEventListener('load', _loadSuccess);
    img.addEventListener('error', _loadError);
    img.addEventListener('abort', _loadError);

    img.src = url;
  }



  window.PhotoView = PhotoView;
})();
