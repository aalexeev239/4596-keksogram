(function() {
  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];

  var previewImage = filterForm.querySelector('.filter-image-preview');
  var prevButton = filterForm['filter-prev'];
  var selectedFilter = filterForm['upload-filter'];

  var filterMap;
  var diff = new Date - new Date(1989, 8, 25);
  var expires = new Date;
  expires.setTime(Date.now() + diff);

  if (docCookies && docCookies.hasItem('filter')) {
    var filter = docCookies.getItem('filter');

    previewImage.className = 'filter-image-preview' + ' ' + filter;

    if (filterForm['upload-filter-'+filter]) {
      selectedFilter.value = filter;
    }
  }


  function setFilter() {
    if (!filterMap) {
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    previewImage.className = 'filter-image-preview' + ' ' + filterMap[selectedFilter.value];
    if (docCookies) {
      docCookies.setItem('filter', selectedFilter.value, expires);
    }
  };



  for (var i = 0, l = selectedFilter.length; i < l; i++) {
    selectedFilter[i].onchange = function(evt) {
      setFilter();
    }
  }

  prevButton.onclick = function(evt) {
    evt.preventDefault();

    filterForm.reset();
    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  filterForm.onsubmit = function(evt) {
    evt.preventDefault();

    uploadForm.classList.remove('invisible');
    filterForm.classList.add('invisible');
  }

  setFilter();
})();
