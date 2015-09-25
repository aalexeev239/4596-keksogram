var pictureTemplate = (function() {
  'use strict';

  var filtersBlock,
      picturesBlock,
      template,
      IMAGE_FAILURE_TIMEOUT = 10000;


  var pictureTemplate = {
    init: function(){
      var frag = document.createDocumentFragment();

      filtersBlock = document.querySelector('.filters');
      picturesBlock = document.querySelector('.pictures');
      template = document.getElementById('picture-template');

      if (!filtersBlock || !picturesBlock || !template) return;

      filtersBlock.classList.add('hidden');

      pictures.forEach(function(picture, i) {
        frag.appendChild(pictureTemplate.getHTML(picture));
      });

      picturesBlock.appendChild(frag);
      filtersBlock.classList.remove('hidden');
    },
    getHTML: function(picture) {
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
    }
  };

  return pictureTemplate;
}());


// initing module
document.addEventListener("DOMContentLoaded", function(){
  pictures && pictureTemplate.init();
});
