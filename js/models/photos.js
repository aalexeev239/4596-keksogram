/* global Backbone: true PhotoModel: true */

'use strict';

(function() {

  /**
   * @constructor
   * @extends {Backbone.Model}
   */
  var PhotosCollection = Backbone.Collection.extend({
    model: PhotoModel,
    url: 'data/pictures.json'
  });


  window.PhotosCollection = PhotosCollection;
})();
