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
    template: _.template(templateString),


    /**
     * @override
     */
    initialize: function() {
      this._onModelLike = this._onModelLike.bind(this);
      this._onClick = this._onClick.bind(this);

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
      this.el.innerHTML = this.template(this.model.attributes);
    },


    /**
     * mapping events
     * @type {Object.<string, string>}
     */
    events: {
      'click': '_onClick'
    },


    /**
     * click handler, check if like btn was pressed
     * @param   {MouseEvent} ev
     * @private
     */
    _onClick: function(ev) {
      var target = ev.target;

      // if clicked on like toggle like and stop evaluating
      if (target.classList.contains('likes-count')) {

        ev.stopImmediatePropagation();

        if (this.model.get('liked')) {
          this.model.dislike();
        } else {
          this.model.like();
        }
        return false;
      }
    },


    _onModelLike: function() {
      var likeBtn = this.el.querySelector('.likes-count');

      if (likeBtn) {
        var currentVal = parseInt(likeBtn.textContent, 10);
        if (this.model.get('liked')) {
          likeBtn.textContent = currentVal + 1;
          likeBtn.classList.add('likes-count-liked');
        } else {
          likeBtn.textContent = currentVal - 1;
          likeBtn.classList.remove('likes-count-liked');
        }
      }
    }
  });


  window.PhotoPreview = PhotoPreview;
})();
