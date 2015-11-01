// (function() {
//   var uploadForm = document.forms['upload-select-image'];
//   var resizeForm = document.forms['upload-resize'];
//   var filterForm = document.forms['upload-filter'];

//   var previewImage = resizeForm.querySelector('.resize-image-preview');
//   var prevButton = resizeForm['resize-prev'];

//   prevButton.onclick = function(evt) {
//     evt.preventDefault();

//     resizeForm.reset();
//     uploadForm.reset();
//     resizeForm.classList.add('invisible');
//     uploadForm.classList.remove('invisible');
//   };

//   resizeForm.onsubmit = function(evt) {
//     evt.preventDefault();
//     filterForm.elements['filter-image-src'] = previewImage.src;

//     resizeForm.classList.add('invisible');
//     filterForm.classList.remove('invisible');
//   };
// })();
'use strict';

window.addEventListener('resizerchange', function() {
var constraint = resizer.getConstraint();
var x = 0 > constraint.x ? 0 : 'undefined';
var y = 0 > constraint.y ? 0 : 'undefined';
var side = squareSize.max > constraint.side ? constraint.side : squareSize.max;

if (typeof x === 'undefined' && imgWidth - constraint.x < constraint.side) {
x = imgWidth - constraint.side;
}

if (typeof y === 'undefined' && imgHeight - constraint.y < constraint.side) {
y = imgHeight - constraint.side;
}

if (typeof x !== 'undefined' || typeof y !== 'undefined') {
constraint.side = side;
resizer.setConstraint(x, y, constraint.side);
}

if ((typeof x !== 'undefined') || (typeof y !== 'undefined') && squareSize.max < parseInt(squareSize.value, 10)) {
constraint.side = Math.min(parseInt(squareSize.value, 10), squareSize.max);
}

});
