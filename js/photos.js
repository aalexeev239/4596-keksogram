/* global PhotosCollection: true PhotoView: true Gallery */
'use strict';
var photos = (function() {

  var ReadyState = {
    'UNSENT': 0,
    'OPENED': 1,
    'HEADERS_RECEIVED': 2,
    'LOADING': 3,
    'DONE': 4
  };


  var filtersBlock;
  var picturesBlock;
  var currentPictures;
  var renderedViews = [];
  var REQUEST_FAILURE_TIMEOUT = 10000;



  // 3 months
  var FILTER_NEW_AMOUNT = 3 * 30 * 24 * 60 * 60 * 1000;

  var SCROLL_TROTTLE = 100;

  var PAGE_SIZE = 12;
  var currentPage = 0;

  var pictures;

  var gallery = new Gallery();
  var photosCollection = new PhotosCollection();


  var me = {
    init: function() {

      // setting up global DOM objects
      filtersBlock = document.querySelector('.filters');
      picturesBlock = document.querySelector('.pictures');

      if (!filtersBlock || !picturesBlock) {
        return;
      }

      filtersBlock.classList.add('hidden');

      // load pictures
      picturesBlock.classList.add('pictures-loading');
      // this.loadData(this.onLoadSuccess, this.onLoadFailure);
      photosCollection.fetch({timeout: REQUEST_FAILURE_TIMEOUT}).success(function (loaded, state, jqXHR) {
        pictures = jqXHR.responseJSON;
        me.setupFilters();
      }).fail(function () {
        me.onLoadFailure();
      });
    },
    loadData: function(success, failure) {

      var xhr = new XMLHttpRequest();
      xhr.timeout = REQUEST_FAILURE_TIMEOUT;
      xhr.open('get', 'data/pictures.json');

      xhr.onreadystatechange = function(ev) {
        var loadedxhr = ev.target;

        switch (loadedxhr.readyState) {
          case ReadyState.OPENED:
          case ReadyState.HEADERS_RECEIVED:
          case ReadyState.LOADING:
            picturesBlock.classList.add('pictures-loading');
            break;

          case ReadyState.DONE:
          default:
            picturesBlock.classList.remove('pictures-loading');

            if (loadedxhr.status === 200) {
              var data = loadedxhr.response;
              success(JSON.parse(data));
            } else {
              failure();
            }
        }
      };

      xhr.send();
    },
    onLoadFailure: function() {
      picturesBlock.classList.remove('pictures-loading');
      picturesBlock.classList.add('pictures-failure');
    },
    onLoadSuccess: function(data) {
      pictures = data;

      // setup main part
      me.setupFilters();

      // gallery.set
      window.addEventListener('galleryclick', onGalleryClick);
    },
    // main rendering function
    renderPictures: function(pageNumber, replace) {
      replace = typeof replace !== 'undefined' ? replace : true;
      pageNumber = pageNumber || 0;

      if (replace) {
        while (renderedViews.length) {
          var viewToRemove = renderedViews.shift();
          picturesBlock.removeChild(viewToRemove.el);
          viewToRemove.off('galleryclick');
          viewToRemove.remove();
        }
      }

      var frag = document.createDocumentFragment();

      var renderFrom = pageNumber * PAGE_SIZE;
      var renderTo = renderFrom + PAGE_SIZE;
      // var picturesToRender = items.slice(renderFrom, renderTo);

      photosCollection.slice(renderFrom, renderTo).forEach(function(model) {
        var view = new PhotoView({model: model});

        view.render();
        frag.appendChild(view.el);
        renderedViews.push(view);

        view.on('galleryclick', function() {

        });
      });

      picturesBlock.appendChild(frag);
    },
    setupFilters: function() {

      var filterId = localStorage.getItem('filterId');

      if (!filtersBlock.filter) {
        return;
      }

      if (filterId) {
        filtersBlock.filter.value = filterId;
      }

      filtersBlock.addEventListener('change', function() {
        me.setFilter(filtersBlock.filter.value);
      });

      picturesBlock.classList.remove('pictures-loading');
      filtersBlock.classList.remove('hidden');

      me.setFilter(filterId);
      me.initScroll();
    },
    setFilter: function(filterId) {
      currentPictures = me.applyFilter(pictures, filterId);
      currentPage = 0;
      // destroy all photos in gallery
      gallery.resetPhotos();

      photosCollection.reset(currentPictures);
      me.renderPictures(currentPage, true);

      if (filterId) {
        localStorage.setItem('filterId', filterId);
      }
    },
    applyFilter: function(items, val) {
      var res;
      switch (val) {
        case 'new':
          res = items.filter(function(a) {
            var dateA = Date.parse(a.date);
            var now = Date.now();

            return now - dateA < FILTER_NEW_AMOUNT;
          }).sort(function(a, b) {
            var dateA = Date.parse(a.date);
            var dateB = Date.parse(b.date);

            return dateB - dateA;
          });
          break;

        case 'discussed':
          res = items.sort(function(a, b) {
            return b.comments - a.comments;
          });
          break;

        default:
          res = items.slice(0);
      }
      return res;
    },
    initScroll: function() {



      var timer;
      var pageFillTimer;

      function isAtTheBottom() {
        var GAP = 100;
        return picturesBlock.getBoundingClientRect().bottom - GAP <= window.innerHeight;
      }

      function isNextPageAvailable() {
        return currentPage < Math.ceil(pictures.length / PAGE_SIZE);
      }

      function checkNextPage() {
        if (isAtTheBottom() && isNextPageAvailable()) {
          window.dispatchEvent(new CustomEvent('uploadpictures'));
          return true;
        }
        return false;
      }

      window.addEventListener('scroll', function() {
        clearTimeout(timer);
        timer = setTimeout(checkNextPage, SCROLL_TROTTLE);
      });

      window.addEventListener('uploadpictures', function() {
        me.renderPictures(currentPictures, ++currentPage, false);
      });

      // check if there is empty space
      pageFillTimer = setTimeout(function checkWindowFill() {
        if (checkNextPage()) {
          pageFillTimer = setTimeout(checkWindowFill, 2000);
        } else {
          clearTimeout(pageFillTimer);
        }
      }, 2000);


    }
  };

  function onGalleryClick(ev) {
    var photo = ev.detail;

    // check that all is ok
    if (!photo.isImageLoaded) {
      return;
    }

    // recalculate currently loaded images
    var loadedPhotos = renderedViews.filter(function(item) {
      return item.isImageLoaded;
    }).map(function(item) {
      return item.imageUrl;
    });
    if (loadedPhotos.length !== gallery.getPhotosCount()) {
      gallery.setPhotos(loadedPhotos);
    }

    gallery.setCurrentPhoto(loadedPhotos.indexOf(photo.imageUrl));

    gallery.show();

  }



  return me;
}());


// initing module
photos.init();
