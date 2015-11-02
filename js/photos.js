/* global
  PhotosCollection: true
  PhotoView: true
  Gallery: true
*/

'use strict';

(function() {

  /**
   * timeout to load photos
   * @const
   * @type {number}
   */
  var REQUEST_FAILURE_TIMEOUT = 10000;


  /**
   * value for new filter
   * @const
   * @type {number}
   */
  var FILTER_NEW_AMOUNT = 3 * 30 * 24 * 60 * 60 * 1000;


  /**
   * @const
   * @type {number}
   */
  var PAGE_SIZE = 12;


  /**
   * @const
   * @type {number}
   */
  var SCROLL_TROTTLE = 100;


  /**
   * throttle to load more photos on initial page loading
   * @type {number}
   */
  var FILL_PAGE_THROTTLE = 2000;


  /**
   * block containing filters
   * @type {Element}
   */
  var filtersBlock = document.querySelector('.filters');


  /**
   * block containing photos
   */
  var photosBlock = document.querySelector('.pictures');


  /**
   * @type {PhotosCollection}
   */
  var photosCollection = new PhotosCollection();


  /**
   * @type {Array.<Object>}
   */
  var photosLoaded;



  /**
   * array containing filtered photos
   * @type {Array.<Object>}
   */
  var photosFiltered;


  /**
   * array containing rendered photos
   * @type {Array.<Object>}
   */
  var photosRendered = [];


  /**
   * variable for iterating pages
   * @type {number}
   */
  var currentPage = 0;



  var gallery = new Gallery();



  /**
   * main rendering function. Add to exist/replace new PAGE_SIZE count of photos
   * @param  {number} pageNumber
   * @param  {boolean} replace
   */
  function renderPhotos(pageNumber, replace) {
    replace = replace ? true : false;
    pageNumber = pageNumber || 0;
    var fragment = document.createDocumentFragment();
    var photosFrom = pageNumber * PAGE_SIZE;
    var photosTo = photosFrom + PAGE_SIZE;

    if (replace) {
      while (photosRendered.length) {
        var photoToRemove = photosRendered.shift();
        photosBlock.removeChild(photoToRemove.el);
        photoToRemove.off('galleryclick');
        photoToRemove.remove();
      }
    }

    photosCollection.slice(photosFrom, photosTo).forEach(function(model) {
      var view = new PhotoView({model: model});
      view.render();
      fragment.appendChild(view.el);
      photosRendered.push(view);

      view.on('galleryclick', function() {
        gallery.setCurrentPhoto(photosRendered.indexOf(this));
        gallery.show();
      });
    });

    photosBlock.appendChild(fragment);
  }


  /**
   * initing Filters function: read from localStorage and apply filter,
   * setup listeners
   */
  function initFilters() {
    var filterId = localStorage.getItem('filterId');

    // check for 'filter' property of form
    if (!filtersBlock.filter) {
      return;
    }

    // set value of filtersBlock
    if (filterId) {
      filtersBlock.filter.value = filterId;
    }

    filtersBlock.addEventListener('change', function() {
      setFilter(filtersBlock.filter.value);
    });

    filtersBlock.classList.remove('hidden');
    setFilter(filtersBlock.filter.value);
  }


  /**
   * filter items, write filterId to localStorage
   * @param {string=} filterId
   */
  function setFilter(filterId) {
    photosFiltered = applyFilter(photosLoaded, filterId);
    photosCollection.reset(photosFiltered);
    currentPage = 0;
    renderPhotos(currentPage, true);

    gallery.setPhotos(photosCollection);

    if (filterId) {
      localStorage.setItem('filterId', filterId);
    }
  }


  /**
   * get photos array and return filtered items
   * @param  {Array.<Object>} items
   * @param  {string=} val
   * @return {Array.<Object>}
   */
  function applyFilter(items, val) {
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
  }


  /**
   * check empty space and trigger rendering if possible
   */
  function initPhotoRendering() {

    var scrollTimer;
    var pageFillTimer;

    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(_checkNextPage, SCROLL_TROTTLE);
    });

    window.addEventListener('upload_photos', function() {
      renderPhotos(++currentPage, false);
    });

    // check if there is empty space
    pageFillTimer = setTimeout(function _checkWindowFill() {
      if (_checkNextPage()) {
        pageFillTimer = setTimeout(_checkWindowFill, FILL_PAGE_THROTTLE);
      } else {
        clearTimeout(pageFillTimer);
      }
    }, FILL_PAGE_THROTTLE);
  }


  /**
   * check if we got the bottom of the page
   * @return  {boolean}
   * @private
   */
  function _isAtTheBottom() {
    var GAP = 100;
    return photosBlock.getBoundingClientRect().bottom - GAP <= window.innerHeight;
  }


  /**
   * check if we can load render more photos
   * @return  {boolean}
   * @private
   */
  function _isNextPageAvailable() {
    return currentPage <= Math.floor(photosFiltered.length / PAGE_SIZE);
  }


  /**
   * fire the event since we reached the bottom and can load photos
   * @return  {boolean}
   * @private
   */
  function _checkNextPage() {
    if (_isAtTheBottom() && _isNextPageAvailable()) {
      window.dispatchEvent(new CustomEvent('upload_photos'));
      return true;
    }
    return false;
  }




  // before load
  filtersBlock.classList.add('hidden');
  photosBlock.classList.add('pictures-loading');

  photosCollection.fetch({timeout: REQUEST_FAILURE_TIMEOUT}).success(function(loaded) {
    photosLoaded = loaded;
    photosBlock.classList.remove('pictures-loading');
    initFilters();
    initPhotoRendering();
  }).fail(function() {
    photosBlock.classList.remove('pictures-loading');
    photosBlock.classList.add('pictures-failure');
  });


})();
