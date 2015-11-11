'use strict';

(function() {


  /**
   * template string
   * @type {string}
   */
  var templateString = document.getElementById('gallery-preview-template').textContent;

  /**
   * @constructor
   * @extends {Backbone.View}
   */
  var PhotoPreview = Backbone.View.extend({


    /**
     * @type {string}
     * @override
     */
    // template: _.template(templateString),


    /**
     * @override
     */
    initialize: function() {
      this._onModelLike = this._onModelLike.bind(this);
      // this._onLikeClick = this._onLikeClick.bind(this);
      // this._onImgClick = this._onImgClick.bind(this);

      this.model.on('change:liked', this._onModelLike);
    },


    /**
     * rendering classname
     * @type {string}
     * @override
     */
    className: 'gallery-overlay-preview',

    /**
     * rendering
     * @override
     */
    render: function() {
      // this.el.innerHTML = this.template(this.model.attributes);
      this.el.querySelector('.gallery-overlay-image').src = this.model.get('url');
      this.el.querySelector('.likes-count').textContent = this.model.get('likes');
      this.el.querySelector('.comments-count').textContent = this.model.get('comments');
    },


    /**
     * mapping events
     * @type {Object.<string, string>}
     */
    events: {
      'click img': '_onImgClick',
      'click .likes-count': '_onLikeClick'
    },


    /**
     * click handler, check if like btn was pressed
     * @param   {MouseEvent} ev
     * @private
     */
    _onLikeClick: function() {
      console.log('cl');
      if (this.model.get('liked')) {
        this.model.dislike();
      } else {
        this.model.like();
      }
      return false;
    },

    /**
     * click handler, check if like btn was pressed
     * @param   {MouseEvent} ev
     * @private
     */
    _onImgClick: function() {
      console.log('ww');
      this.trigger('galleryclick');
    },


    _onModelLike: function() {
      var likeBtn = this.el.querySelector('.likes-count');

      if (likeBtn) {
        if (this.model.get('liked')) {
          likeBtn.textContent = this.model.get('likes') + 1;
          likeBtn.classList.add('likes-count-liked');
        } else {
          likeBtn.textContent = this.model.get('liked');
          likeBtn.classList.remove('likes-count-liked');
        }
      }
    }
  });


  window.PhotoPreview = PhotoPreview;
})();
