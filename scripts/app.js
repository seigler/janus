(function () {
  'use strict';

  var slides = [],
  currentSlideNumber = 0,
  slideNext,
  slidePrev;

  function $(selector) {
    return document.querySelector(selector);
  }
  function $$(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
  }

  function setCurrentSlide(newSlideNumber) {
    newSlideNumber = Math.max(Math.min(newSlideNumber, slides.length - 1), 0);
    if (newSlideNumber !== currentSlideNumber) {
      currentSlideNumber = newSlideNumber;
      localStorage.setItem('janus-currentSlideNumber', currentSlideNumber);
    }
    slides.forEach(function (item, index, array) {
      if (index < currentSlideNumber) {
        if (slides[index].contains(slides[currentSlideNumber])) {
          item.setAttribute('janus-timeline', 'present');
        } else {
          item.setAttribute('janus-timeline', 'past');
        }
      } else if (index === currentSlideNumber) {
        item.setAttribute('janus-timeline', 'present');
      } else {
        item.setAttribute('janus-timeline', 'future');
      }
    });
  }

  var sessionListener = function(e) {
    console.log(e);
    if (e.url === window.location.href) {
      if (e.key === 'janus-currentSlideNumber') {
        setCurrentSlide(+e.newValue);
      }
    }
  };

  var init = function() {
    slides = $$('main>section, [janus-timeline]');
    currentSlideNumber = 0;
    shortcut.add('F1', function() {
      document.body.classList.toggle('show-notes');
    });
    shortcut.add('F2', function() {
      window.open(window.location.href, '_blank');
    });
    shortcut.add('Page_down', function() {
      setCurrentSlide(currentSlideNumber + 1);
    });
    shortcut.add('Page_up', function() {
      setCurrentSlide(currentSlideNumber - 1);
    });
    var storedSlideNumber;
    if (storedSlideNumber = localStorage.getItem('janus-currentSlideNumber')) {
      setCurrentSlide(storedSlideNumber);
    } else {
      setCurrentSlide(0);
    }
  };

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('storage', sessionListener);
})();
