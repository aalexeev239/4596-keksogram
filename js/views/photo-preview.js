'use strict';

(function() {

  /**
   * @constructor
   * @extends {Backbone.View}
   */
  var PhotoPreview = Backbone.View.extend({
    /**
     * rendering tag
     * @type {Element}
     * @override
     */
    tagName: 'img',

    /**
     * rendering
     * @override
     */
    render: function() {
      this.el.src = this.model.get('url');
    }
  });


  window.PhotoPreview = PhotoPreview;
})();
