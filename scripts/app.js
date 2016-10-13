(function () {
  'use strict';

  var slides = [],
  currentSlideNumber = 0,
  slideNext,
  slidePrev,
  commandBar,
  commandField,
  commandBarVisible = true;

  function $(selector) {
    return document.querySelector(selector);
  }
  function $$(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
  }

  function setCurrentSlide(newSlideNumber, storeChange) {
    newSlideNumber = Math.max(Math.min(newSlideNumber, slides.length - 1), 0);
    if (newSlideNumber !== currentSlideNumber) {
      currentSlideNumber = newSlideNumber;
      if (storeChange) {
        localStorage.setItem('janus-currentSlideNumber', currentSlideNumber);
      }
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
    if (e.url === window.location.href) {
      if (e.key === 'janus-currentSlideNumber') {
        setCurrentSlide(+e.newValue, false);
      }
    }
  };

  var toggleCommandBar = function() {
    if (commandBarVisible) {
      commandBar.style.display = 'none';
      commandBarVisible = false;
    } else {
      commandBar.style.display = 'flex';
      commandField.value = '';
      commandField.focus();
      commandBarVisible = true;
    }
  }

  var commandListener = function(event) {
    var typed = String.fromCharCode(event.keyCode).toLowerCase();
    console.log(event);
    console.log(typed);
    if (/[0-9]/.test(typed)) {
      return;
    } else if (event.keyCode === 13) {
      runCommand(commandField.value);
      toggleCommandBar();
    } else if (/[spc]/.test(typed)) {
      runCommand(commandField.value + typed);
      toggleCommandBar();
    }
  };

  var runCommand = function(command) {
    var s = command.split();
    if (s.length === 1 && /^[0-9]+$/.test(s[0])) {
      setCurrentSlide(+s[0], true);
    } else if (s.length === 1) {
      switch(s[0]) {
        case 's':
          document.body.classList.toggle('simulate-projection');
          break;
        case 'p':
          document.body.classList.toggle('show-notes');
          break;
        case 'c':
          window.open(window.location.href, '_blank');
          break;
      }
    }
  }

  var init = function() {
    commandField = $('#commandField');
    commandField.addEventListener('keydown', commandListener);
    commandBar = $('body > nav');
    toggleCommandBar();

    slides = $$('main>section, [janus-timeline]');
    currentSlideNumber = 0;
    shortcut.add('F1', function() {
      document.body.classList.toggle('show-notes');
    });
    shortcut.add('F2', function() {
      window.open(window.location.href, '_blank');
    });
    shortcut.add('Page_down', function() {
      setCurrentSlide(currentSlideNumber + 1, true);
    });
    shortcut.add('Page_up', function() {
      setCurrentSlide(currentSlideNumber - 1, true);
    });
    shortcut.add('Escape', toggleCommandBar);
    var storedSlideNumber;
    if (storedSlideNumber = localStorage.getItem('janus-currentSlideNumber')) {
      setCurrentSlide(storedSlideNumber, false);
    } else {
      setCurrentSlide(0);
    }
    document.body.classList.remove('is-loading');
  };

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('storage', sessionListener);
})();
