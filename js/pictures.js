/*
  global
    $:true
*/
'use strict';
var pictureTemplate = (function() {

  var filtersBlock;
  var picturesBlock;
  var currentPictures;
  var template;
  var IMAGE_FAILURE_TIMEOUT = 10000;
  var REQUEST_FAILURE_TIMEOUT = 10000;
  var ReadyState = {
    'UNSENT': 0,
    'OPENED': 1,
    'HEADERS_RECEIVED': 2,
    'LOADING': 3,
    'DONE': 4
  };

  // 3 months
  var FILTER_NEW_AMOUNT = 3 * 30 * 24 * 60 * 60 * 1000;

  var CASCADE_DELAY = 250;

  var SCROLL_TROTTLE = 100;

  var PICTURE_SIZE = 182;

  var PAGE_SIZE = 12;
  var currentPage = 0;

  var pictures;


  var me = {
    init: function() {

      // setting up global DOM objects
      filtersBlock = document.querySelector('.filters');
      picturesBlock = document.querySelector('.pictures');
      template = document.getElementById('picture-template');

      if (!filtersBlock || !picturesBlock || !template) {
        return;
      }


      filtersBlock.classList.add('hidden');

      // load pictures
      picturesBlock.classList.add('pictures-loading');
      this.loadData(this.onLoadSuccess, this.onLoadFailure);
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
    },
    // main rendering function
    renderPictures: function(items, pageNumber, replace) {
      replace = typeof replace !== 'undefined' ? replace : true;
      pageNumber = pageNumber || 0;

      if (replace) {
        picturesBlock.innerHTML = '';
      }

      var frag = document.createDocumentFragment();

      var renderFrom = pageNumber * PAGE_SIZE;
      var renderTo = renderFrom + PAGE_SIZE;
      var picturesToRender = items.slice(renderFrom, renderTo);

      var len = picturesToRender.length;
      var showImg = new $.Deferred();


      // get items
      picturesToRender.forEach(function(item) {
        var rendered = me.getPictureHTML(item);
        var picImg = rendered.querySelector('img');

        item.rendered = rendered;

        me.loadImage(item.url).done(function(res) {
          // save picture on success
          item.imgData = res;
        }).always(function() {
          picImg.classList.add('picture-load-failure');

          if (--len === 0) {
            // check if all images passed
            showImg.resolve();
          }
        });

        frag.appendChild(rendered);
      });

      // when all images passed
      showImg.done(function() {
        // get loaded images
        var successLoaded = picturesToRender.filter(function(item) {
          return item.hasOwnProperty('imgData');
        });

        //  render images on timer
        var timer = setTimeout(function cascade() {

          var item = successLoaded.shift();

          if (!item) {
            clearTimeout(timer);
          } else {
            var elem = item.rendered;
            var picImg = elem.querySelector('img');
            var img = item.imgData;
            picImg.classList.remove('picture-load-failure');
            elem.replaceChild(img, picImg);
            img.style.width = PICTURE_SIZE;
            img.style.hight = PICTURE_SIZE;
          }
          timer = setTimeout(cascade, CASCADE_DELAY);
        }, CASCADE_DELAY);
      });


      picturesBlock.appendChild(frag);
    },
    loadImage: function(url) {
      function loadImage(deferred) {
        var img = new Image();


        var imgTimer = setTimeout(errored, IMAGE_FAILURE_TIMEOUT);

        img.onload = loaded;
        img.onerror = errored;

        img.src = url;

        function loaded() {
          unbindEvents();
          deferred.resolve(img);
        }

        function errored() {
          unbindEvents();
          deferred.reject(img);
        }

        function unbindEvents() {
          clearTimeout(imgTimer);
          img.onload = null;
          img.onerror = null;
        }
      }

      var promise = (new $.Deferred(loadImage)).promise();

      return promise;
    },
    // get basic markup for one item
    getPictureHTML: function(picture) {

      var pic = template.content.children[0].cloneNode(true);
      var picLikes = pic.querySelector('.picture-likes');
      var picComments = pic.querySelector('.picture-comments');

      if (picture.hasOwnProperty('likes')) {
        picLikes.textContent = picture.likes;
      } else {
        picLikes.textContent = 0;
      }

      if (picture.hasOwnProperty('comments') || picture.comments === 0) {
        picComments.textContent = picture.comments;
      } else {
        picComments.textContent = 0;
      }

      return pic;
    },
    setupFilters: function() {

      var filterId = localStorage.getItem('filterId');

      if (!filtersBlock.filter) {
        return;
      }

      if (filterId) {
        filtersBlock.filter.value = filterId;
      };

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
      me.renderPictures(currentPictures, currentPage, true);

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



  return me;
}());


// initing module
document.addEventListener('DOMContentLoaded', function() {
  pictureTemplate.init();
});
