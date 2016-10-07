(function () {
  'use strict';

  var slides = [],
  currentSlideNumber = 0,
  slideNext,
  slidePrev;

  function $$(selector){
    return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
  }

  function moveSlides() {
    slides.forEach(function (item, index, array) {
      if (index < currentSlideNumber) {
        item.setAttribute('janus-timeline', 'past');
      } else if (index == currentSlideNumber) {
        item.setAttribute('janus-timeline', 'present');
      } else {
        item.setAttribute('janus-timeline', 'future');
      }
    });
  }

  var init = function() {
    slides = $$('main>section');
    currentSlideNumber = 0;
    shortcut.add('Page_down', function() {
      if (currentSlideNumber < slides.length - 1) {
        currentSlideNumber++;
        moveSlides();
      }
    });
    shortcut.add('Page_up', function() {
      if (currentSlideNumber > 0) {
        currentSlideNumber--;
        moveSlides();
      }
    });
    moveSlides();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
