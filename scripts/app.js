/*jslint browser: true*/
/*global shortcut, Behave, hljs*/

(function () {
  "use strict";

  var slides = [],
    syncFormElements = [],
    currentSlideNumber = 0,
    slideNext,
    slidePrev,
    commandBar,
    commandField,
    commandBarVisible = true,
    localStorageActions;

  /* Dom helper functions. Who needs JQuery?? */
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
        localStorage.setItem("janus-currentSlideNumber", currentSlideNumber);
      }
    }
    slides.forEach(function (item, index, array) {
      if (index < currentSlideNumber) {
        if (slides[index].contains(slides[currentSlideNumber])) {
          item.setAttribute("janus-timeline", "present");
        } else {
          item.setAttribute("janus-timeline", "past");
        }
      } else if (index === currentSlideNumber) {
        item.setAttribute("janus-timeline", "present");
      } else {
        item.setAttribute("janus-timeline", "future");
      }
    });
  }

  function sessionListener(event) {
    if (event.url === window.location.href && localStorageActions[event.key]) {
      localStorageActions[event.key](event);
    }
  }

  function toggleCommandBar(visible) {
    if (visible === false) {
      commandBar.style.display = "none";
      commandBarVisible = false;
    } else if (visible === true) {
      commandBar.style.display = "flex";
      commandField.value = "";
      commandField.focus();
      commandBarVisible = true;
    }
  }

  function setMouseX(value, storeChange) {
    $("section[janus-timeline=\"present\"]").style.setProperty("--mouse-x", value);
    if (storeChange) {
      localStorage.setItem("mouse-x", value);
    }
  }

  function mouseListener(event) {
    var x = event.clientX / window.innerWidth;
    if (event.ctrlKey) {
      setMouseX(x, true);
    }
  }

  function runCommand(command) {
    var commands, s;
    commands = {
      "s": function () {
        document.body.classList.toggle("simulate-projection");
      },
      "p": function () {
        document.body.classList.toggle("show-notes");
      },
      "c": function () {
        window.open(window.location.href, "_blank");
      },
      "r": function () {
        localStorage.clear();
        setCurrentSlide(0, true);
      }
    };
    s = command.split();
    if (s.length === 1 && /^[0-9]+$/.test(s[0])) {
      setCurrentSlide(+s[0], true);
    } else if (s.length === 1 && commands[s]) {
      commands[s]();
    }
  }

  function commandListener(event) {
    var typed = String.fromCharCode(event.keyCode).toLowerCase();
    if (/[0-9]/.test(typed)) {
      return;
    } else if (event.keyCode === 13) {
      runCommand(commandField.value);
      toggleCommandBar(false);
    } else if (/[spcr]/.test(typed)) {
      runCommand(commandField.value + typed);
      toggleCommandBar(false);
    }
  }

  function editorListenerGenerator(editor) {
    var frameWindow, listener,
      textareas = [
        editor.querySelector("[name=\"html\"]"),
        editor.querySelector("[name=\"css\"]"),
        editor.querySelector("[name=\"js\"]")
      ],
      highlights = [
        editor.querySelector("[name=\"html\"] + .highlight"),
        editor.querySelector("[name=\"css\"] + .highlight"),
        editor.querySelector("[name=\"js\"] + .highlight")
      ],
      frameEl = editor.querySelector("iframe");
    if (frameEl.contentWindow) {
      frameWindow = frameEl.contentWindow;
    } else {
      if (frameEl.contentDocument && frameEl.contentDocument.document) {
        frameWindow = frameEl.contentDocument.document;
      } else {
        frameWindow = frameEl.contentDocument;
      }
    }
    function editorAction() {
      var compiled = "<!DOCTYPE html><html><head><style>" + textareas[1].value + "</style></head><body>" + textareas[0].value + "<scr" + "ipt>" + textareas[2].value + "</scr" + "ipt></body></html>";
      frameWindow.document.open();
      frameWindow.document.write(compiled);
      frameWindow.document.close();
      textareas.forEach(function (current, index, array) {
        highlights[index].innerHTML = hljs.highlight(["html", "css", "js"][index], current.value + "\n", true).value;
      });
    }
    textareas.forEach(function (current, index, array) {
      var syncFormElementsIndex = syncFormElements.indexOf(current), editor;
      editor = new Behave({
        textarea: current,
        replaceTab: true,
        softTabs: true,
        tabSize: 2,
        autoOpen: true,
        overwrite: true,
        autoStrip: true,
        autoIndent: true,
        fence: false
      });
      // add a listener to build the source when the fields are changed
      current.addEventListener('input', editorAction);
      current.addEventListener('keydown', editorAction);
      // add a listener to sync the highlight element and the textarea
      current.addEventListener('scroll', function (event) {
        highlights[index].scrollTop = current.scrollTop;
        highlights[index].scrollLeft = current.scrollLeft;
      }, { passive: true });
      // add a listener to receive changes from localStorage
      if (syncFormElementsIndex >= 0) {
        localStorageActions["janus-input-" + syncFormElementsIndex] = function (event) {
          var storedValue = event.newValue,
            decodedValue = storedValue.split("/", 2);
          decodedValue.push(storedValue.slice(decodedValue.join(" ").length + 1));
          current.value = decodedValue[2];
          current.setSelectionRange(+decodedValue[0], +decodedValue[1]);
          editorAction();
          current.focus();
        };
      }
    });
    editorAction();
  }

  function init() {
    var storedSlideNumber;
    commandField = $("#commandField");
    commandField.addEventListener("keydown", commandListener);
    commandField.addEventListener("blur", function (event) {
      toggleCommandBar(false);
    });
    commandBar = $("body > nav");
    toggleCommandBar(false);

    slides = $$("main>section, [janus-timeline]");
    shortcut.add("Page_down", function () {
      setCurrentSlide(currentSlideNumber + 1, true);
    });
    shortcut.add("Page_up", function () {
      setCurrentSlide(currentSlideNumber - 1, true);
    });
    shortcut.add("Escape", function () {
      toggleCommandBar(!commandBarVisible);
    });

    storedSlideNumber = localStorage.getItem("janus-currentSlideNumber");
    if (storedSlideNumber) {
      setCurrentSlide(storedSlideNumber, false);
    } else {
      setCurrentSlide(0);
    }

    document.addEventListener("mousemove", mouseListener);

    localStorageActions = {
      "janus-currentSlideNumber": function (event) {
        setCurrentSlide(+event.newValue, false);
      },
      "mouse-x" : function (event) {
        setMouseX(event.newValue, false);
      }
    };

    $$("[janus-sync]").forEach(function (current, index, array) {
      var currentKey, storedValue, decodedValue, group, replacedText;
      syncFormElements.push(current);
      if (current.type === "textarea" || current.type === "text") {
        currentKey = "janus-input-" + index;
        storedValue = localStorage.getItem(currentKey);
        if (storedValue) {
          decodedValue = storedValue.split("/", 2);
          decodedValue.push(storedValue.slice(decodedValue.join(" ").length + 1));
          current.value = decodedValue[2];
          current.setSelectionRange(+decodedValue[0], +decodedValue[1]);
        } else {
          localStorage.setItem(currentKey, "0/0/" + current.value);
        }
        // add a listener to store changes
        current.addEventListener("keyup", function (event) {
          localStorage.setItem(currentKey, current.selectionStart + "/" + current.selectionEnd + "/" + current.value);
        });
        // add a listener to respond to localStorage updates
        if (!localStorageActions[currentKey]) {
          localStorageActions[currentKey] = function (event) {
            var storedValue = event.newValue,
              decodedValue = storedValue.split("/", 2);
            decodedValue.push(storedValue.slice(decodedValue.join(" ").length + 1));
            current.value = decodedValue[2];
            current.focus();
            current.setSelectionRange(+decodedValue[0], +decodedValue[1]);
          };
        }
      } else if (current.type === "checkbox") {
        currentKey = "janus-input-" + index;
        storedValue = localStorage.getItem(currentKey);
        if (storedValue !== null) {
          current.checked = (storedValue === "true");
        } else {
          localStorage.setItem(currentKey, current.checked);
        }
        // add a listener to store changes
        current.addEventListener("change", function (event) {
          localStorage.setItem(currentKey, current.checked);
        });
        // add a listener to respond to localStorage updates
        if (!localStorageActions[currentKey]) {
          localStorageActions[currentKey] = function (event) {
            current.checked = (event.newValue === "true");
          };
        }
      } else if (current.type === "radio") {
        group = current.getAttribute("name");
        currentKey = "janus-input-" + group;
        storedValue = localStorage.getItem(currentKey);
        if (storedValue !== null && +storedValue === index) {
          current.checked = true;
        } else if (current.checked) {
          localStorage.setItem(currentKey, index);
        }
        // add a listener to store changes
        current.addEventListener("change", function () {
          localStorage.setItem(currentKey, index);
        });
        // add a listener to respond to localStorage updates
        if (!localStorageActions[currentKey]) {
          localStorageActions[currentKey] = function (event) {
            syncFormElements[+event.newValue].checked = true;
          };
        }
      }
    });

    $$(".live-coding").forEach(function (current, index, array) {
      editorListenerGenerator(current);
    });

    document.body.classList.remove("is-loading");
  }

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("storage", sessionListener);
}());
