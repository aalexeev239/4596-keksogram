/* global Backbone: true */

'use strict';

(function() {

  /**
   * @constructor
   * @extends {Backbone.Model}
   */
  var PhotoModel = Backbone.Model.extend({

    /**
     * @override
     */
    initialize: function() {
      this.set('liked', false);
    },

    /**
     * check if image was loaded
     * @type {boolean}
     */
    imageLoaded: false,

    /**
     * like
     */
    like: function() {
      this.set('liked', true);
    },

    /**
     * dislike
     */
    dislike: function() {
      this.set('liked', false);
    }
  });

  window.PhotoModel = PhotoModel;

})();
