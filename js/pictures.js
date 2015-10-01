var pictureTemplate = (function() {
  'use strict';

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
  var FILTER_NEW_AMOUNT = 1*30*24*60*60*1000


  var pictureTemplate = {
    init: function() {

      // setting up global DOM objects
      filtersBlock = document.querySelector('.filters');
      picturesBlock = document.querySelector('.pictures');
      template = document.getElementById('picture-template');

      if (!filtersBlock || !picturesBlock || !template) return;


      filtersBlock.classList.add('hidden');


      this.loadData(this.onLoadSuccess,this.onLoadFailure);
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
      }

      xhr.send();
    },
    onLoadFailure: function() {
      picturesBlock.classList.add('pictures-failure');
    },
    onLoadSuccess: function(data) {
      pictureTemplate.renderPictures(data);
      pictureTemplate.setupFilters(data);
      filtersBlock.classList.remove('hidden');
    },
    renderPictures: function(data) {
      var frag = document.createDocumentFragment();

      // clearing pictureBlock
      picturesBlock.innerHTML = '';

      data.forEach(function(picture, i) {
        frag.appendChild(pictureTemplate.getPictureHTML(picture));
      });

      picturesBlock.appendChild(frag);
    },
    getPictureHTML: function(picture) {
      function imgFailure(){
        picImg.classList.add('picture-load-failure');
      }

      var pic = template.content.children[0].cloneNode(true);
      var picImg = pic.querySelector('img');
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

      if (picture.hasOwnProperty('url')) {
        var img = new Image();

        var imgTimer = setTimeout(imgFailure, IMAGE_FAILURE_TIMEOUT);

        img.onerror = imgFailure;

        img.onload = function() {
          pic.replaceChild(this, picImg)
          this.style.width = 182;
          this.style.hight = 182;
          clearTimeout(imgTimer);
        }

        img.src = picture.url;

      }


      return pic;
    },
    setupFilters: function(pictures) {
      var filterForm = document.querySelector('.filters');

      if (!filterForm.filter) return;

      filterForm.addEventListener('change', function(e) {
        pictureTemplate.renderPictures(pictureTemplate.applyFilter(pictures, filterForm.filter.value));
      });
    },
    applyFilter: function(items, val) {
      var res;
      switch (val) {
        case 'new':
          res = items.filter(function(a){
            var dateA = Date.parse(a.date);
            var now = Date.now();

            return now - dateA < FILTER_NEW_AMOUNT;
          }).sort(function(a,b){
            var dateA = Date.parse(a.date);
            var dateB = Date.parse(b.date);

            return dateB - dateA;
          });

        break;

        case 'discussed':
          res = items.sort(function(a,b){
            return b.comments - a.comments;
          });

        default:
          res = items.slice(0);
      }

      return res;
    }
  };



  return pictureTemplate;
}());


// initing module
document.addEventListener("DOMContentLoaded", function(){
  pictureTemplate.init();
});
