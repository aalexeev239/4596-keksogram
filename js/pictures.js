'use strict';
var pictureTemplate = (function() {

  var filtersBlock;
  var picturesBlock;
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

  // one month
  var FILTER_NEW_AMOUNT = 1 * 30 * 24 * 60 * 60 * 1000;

  var PICTURE_SIZE = 182;


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
      me.renderPictures(data);
      me.setupFilters(data);
      picturesBlock.classList.remove('pictures-loading');
      filtersBlock.classList.remove('hidden');
    },
    // main rendering function
    renderPictures: function(data) {

      var frag = document.createDocumentFragment();

      // clearing pictureBlock
      picturesBlock.innerHTML = '';

      // get items
      data.forEach(function(item) {
        var rendered = me.getPictureHTML(item);
        var picImg = rendered.querySelector('img');


        me.loadImage(item.url).then(function(res) {
          rendered.replaceChild(res, picImg);
          res.style.width = PICTURE_SIZE;
          res.style.hight = PICTURE_SIZE;
        }).fail(function() {
          picImg.classList.add('picture-load-failure');
        });

        frag.appendChild(rendered);
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

      return $.Deferred(loadImage).promise();
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
    setupFilters: function(pictures) {
      var filterForm = document.querySelector('.filters');

      if (!filterForm.filter) {
        return;
      }

      filterForm.addEventListener('change', function() {
        me.renderPictures(me.applyFilter(pictures, filterForm.filter.value));
      });
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
    }
  };



  return me;
}());


// initing module
document.addEventListener('DOMContentLoaded', function() {
  pictureTemplate.init();
});
