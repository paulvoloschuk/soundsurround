(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var SS = SS || {};

// functions
function createElement(name, options){
  let element = document.createElement(name);
  for (let key in options)
    element[key] = options[key];
  return element;
}

// Modules
// App initialize
SS.init = function(){
  // Loading config
  fetch('./config/app.json')
    .then((response) => {
        if (response.status !== 200)
          return console.log(`JSON app config load problems. Status Code: ${response.status}`);
        response.json()
          .then((data) => {SS.config = data})
          .then(() => {
            // Modules initialize
            for (let method in SS)
              if (typeof SS[method].init == 'function')
                SS[method].init();
            SS.preloader.loaded(10);
          })
      }
    )
    .catch((error) => console.log('Fetch Error: -S', error));
}
// Preloader module
SS.preloader = new function Preloader(){
  let initiated = false,
      state = 10,
      container,
      spiners,
      subloadValue = false,
      hideloader = function(){
        // Something happens
        container.classList.remove('initiation');
        SS.controls.generateMenu();
      }
  return{
    init(){
      // Base conditions
      container = window.preloader;
      spiners = Array.from(container.querySelectorAll('circle'));
    },
    loaded(num){
      if (typeof num == 'number' && num > 0)
        state += num;
      spiners.map((item) => item.attributes[0].value = `${state / Math.PI} ${(100 - state) / Math.PI}%`);
      if (state >= 99)
        setTimeout(hideloader.bind(this), 1000);
    },
    subload(action = false){
      let tempValue = '5% 10%';
      if (action == 'close') {
        window.subloader.setAttribute('stroke-dasharray', subloadValue);
        subloadValue = false;
      } else {
        subloadValue = window.subloader.getAttribute('stroke-dasharray');
        window.subloader.setAttribute('stroke-dasharray', tempValue);
      }
    }
  }
}();
// Keyboard controller
SS.keyboard = function(event){
  console.log(event);
}
// Smooth background changer
SS.background = new function Background(){
  let initiated = false,
      loadLimit = 80,
      images,
      container,
      hideOutdatedImages = function(e) {
        let images = Array.from(this.parentElement.children),
            index = images.indexOf(this);
        images.map((item, i) => {
          if (i < index)
            item.remove();
        });
      };
  return {
    init(){
      // Base conditions
      container = window.background;

      // Catching image
      images = Object.keys(SS.config).map((name) => {
        let image = new Image();
        image.onload = () => SS.preloader.loaded(loadLimit / Object.keys(SS.config).length);
        image.src = `img/${name}.jpg`;
        image.alt = name;
        return image;
      });
    },
    replace(name){
      let image = createElement('div', {className: 'image'});
      image.style.backgroundImage = `url(img/${name}.jpg)`;
      container.appendChild(image);

      // Clear mess
      image.addEventListener('animationend', hideOutdatedImages, false);
    }

  }
}
// Menu + controls
SS.controls = new function Controls() {
  let initiated = false,
      container,
      lists,
      inputs,
      focus = {
        list: false,
        sound: false
      },
      listAppear = function(element, degree) {
        return function(){
          element.parentElement.style.transform = `rotate(${degree}deg)`;
          element.style.transform = `rotate(-${degree}deg)`;
          element.style.opacity = '';
        }
      },
      toggleState = function() {
        document.body.classList.toggle('soundmode');
      },
      inputRender = function(input) {
        let pinOffset = parseInt(getComputedStyle(input).width)/100*(100 - input.valueAsNumber) - (parseInt(getComputedStyle(input).height)/100*(100 - input.valueAsNumber));
        this.tooltip.innerText = input.valueAsNumber + '%';
        console.log();
        this.touchElement.style.right =
        this.goozePin.style.right = pinOffset  + 'px';
        this.goozePrepin.style.right = pinOffset + parseInt(getComputedStyle(input).height)/2 + 'px';
        this.goozePrepin.style.borderLeftWidth = 100 - pinOffset - parseInt(getComputedStyle(input).height)/1.8 + 'px';
      },
      deleteMenu = function(){
        this.remove();
      }
  return{
    init() {
      // Base conditions
      container = window.controls;

    },
    focus(element) {
      if (['list', 'sound'].indexOf(element.classList[0]) + 1 && focus[element.classList[0]] !== element) {
        focus[element.classList[0]] = element;
        Array.from(element.parentElement.parentElement.children).map((item) => {
          if (item.firstElementChild === element)
            item.firstElementChild.classList.add('focus');
          else
            item.firstElementChild.classList.remove('focus');
        });
        return true;
      }
      return false;
    },
    generateMenu() {
      let menu = createElement('div', {className: 'menu'}),
          closeButton = createElement('div', {
            className: 'close',
            innerHTML: '&#xf100;',
            onclick: function(e) {
              SS.player.removeAll();
              SS.preloader.subload('close');
              toggleState();
              Array.from(document.querySelectorAll('.gooze, .inputs')).map((item) => {
                setTimeout(deleteMenu.bind(item), 400)
              });
            }
          });
      container.appendChild(menu);
      container.appendChild(closeButton);
      // Filling
      lists = Object.keys(SS.config)
        .map((item, i) => {
          // Constructing
          let sectorSize = 360 / Object.keys(SS.config).length,
              orbit = createElement('div', {className: 'orbit'}),
              content = createElement('span', {className: 'content', innerHTML: `&#xf${SS.config[item][0]};`}),
              tooltip = createElement('div', {className: 'tooltip', innerText: item}),
              list = createElement('div', {
                className: 'list ' + item,
                onclick: function(e) {
                  SS.controls.loadSounds(this.classList[1])
                },
                onmouseover: function(e) {
                  if(SS.controls.focus(this))
                    SS.background.replace(this.classList[1]);
                }
              }),
              rotateValue = 90 + (sectorSize * (i - 1));
              list.appendChild(content);
              list.appendChild(tooltip);


          // Styling
          list.style.transform = `rotate(-${rotateValue}deg)`;
          orbit.style.transform =  `rotate(${rotateValue}deg)`;
          list.style.opacity = 0;
          orbit.appendChild(list);
          menu.appendChild(orbit);

          // Animation
          setTimeout(listAppear.apply(null, [list, i * sectorSize + 90]), parseFloat(getComputedStyle(list).transitionDuration) * 500 * i + 500);

          return list;
        });
    },
    loadSounds(name) {
      // Loading Animation
      SS.preloader.subload();
      SS.player.load(name);
      toggleState();
    },
    loadComplete(name) {
      let salt = Math.floor(Math.random() * (120 - 5 + 1)) + 5,
          sounds = SS.player.getItems(),
          controlContainer = createElement('div', {className: 'inputs'}),
          goozeContainer = createElement('div', {className: 'gooze'});
      // Generating audio controllayers
      inputs = Object.values(sounds).map((item, i) => {
        let rotateValue = 360 / Object.values(sounds).length * i + salt,
            controlOrbit = createElement('div', {
              className: 'orbit',
              style: `transform: rotate(${rotateValue}deg)`
            }),
            goozeOrbit = controlOrbit.cloneNode(false),
            touchElement = createElement('div', {
              className: 'touch',
              innerHTML: `&#xf${SS.config[name][i+1].icon};`,
              style: `transform: rotate(-${rotateValue}deg)`
            }),
            tooltip = createElement('div', {className: 'tooltip'}),
            goozePin = createElement('div', {className: 'pin'}),
            goozePrepin = createElement('div', {className: 'prepin'}),
            input = createElement('input', {
              className: 'sound',
              name: item.name,
              type: 'range',
              value: item.volume * 100,
              callback: {
                touchElement,
                tooltip,
                goozePin,
                goozePrepin
              },
              oninput: function(e) {
                inputRender.call(this.callback, this);
                SS.player.volume(this.name, this.value/100);
              },
              onmouseover: function(e) {
                SS.controls.focus(this);
              }
            });

            // gooze layer
            goozeOrbit.appendChild(goozePrepin);
            goozeContainer.appendChild(goozeOrbit)
              .appendChild(goozePin);
            goozeOrbit.appendChild(goozePrepin);
            container.insertBefore(goozeContainer, container.firstElementChild);

            // controls layer
            controlOrbit.appendChild(input);
            controlContainer.appendChild(controlOrbit)
              .appendChild(touchElement)
              .appendChild(tooltip);
            container.appendChild(controlContainer);

            inputRender.call(input.callback, input);
            return input;
      });
      SS.preloader.subload('close');
      SS.player.playAll();
    }
  }
}();
SS.player = new function Player(){
  let initiated = false,
      container,
      items,
      loaded = 0;
  return {
    init(){
      // Base conditions
      container = createElement('div', {className: "sounds"});
      window.system.appendChild(container);
    },
    getItems() {return items},
    load(name) {
      loaded = 0;
      items = SS.config[name].reduce((result, sound) => {
        if (typeof sound === 'object') {
          let audio = createElement('audio', {
            src: 'audio/' + sound.link,
            name: sound.name,
            volume: sound.value/100,
            loop: true,
            controls: false
          });
          audio.addEventListener('canplaythrough', function(){
            if(++loaded === SS.config[name].length - 1)
              setTimeout(function() {SS.controls.loadComplete(name)}, 1000);
          });
          container.appendChild(result[sound.name] = audio);
        }
        return result;
      }, {});
      // console.log(items);
    },
    playAll(){
      Object.values(items).map((item) => {
        item.play();
      });
    },
    removeAll(){
      Object.values(items).map((item) => item.remove());
    },
    volume(soundName, value){
      items[soundName].volume = value;
    }
  }
}();

document.addEventListener("DOMContentLoaded", function () {
  //Init
  SS.init();

  // info
  window.info.onclick = function (e) {
    if (['button', 'background'].indexOf(e.target.className) + 1) this.classList.toggle('opened');
  };
  window.onkeydown = function (e) {
    return SS.keyboard(e);
  };
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9qcy9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL3NyYy9qcy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLElBQUksS0FBSyxNQUFNLEVBQWY7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxZQUFVO0FBQ3REO0FBQ0EsS0FBRyxJQUFIOztBQUVBO0FBQ0EsU0FBTyxJQUFQLENBQVksT0FBWixHQUFzQixVQUFTLENBQVQsRUFBVztBQUMvQixRQUFHLENBQUMsUUFBRCxFQUFXLFlBQVgsRUFBeUIsT0FBekIsQ0FBaUMsRUFBRSxNQUFGLENBQVMsU0FBMUMsSUFBdUQsQ0FBMUQsRUFDRSxLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLFFBQXRCO0FBQ0gsR0FIRDtBQUlBLFNBQU8sU0FBUCxHQUFtQixVQUFDLENBQUQ7QUFBQSxXQUFPLEdBQUcsUUFBSCxDQUFZLENBQVosQ0FBUDtBQUFBLEdBQW5CO0FBQ0QsQ0FWRCIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmxldCBTUyA9IFNTIHx8IHt9O1xyXG5cclxuLy8gZnVuY3Rpb25zXHJcbi8vPSBfZnVuY3Rpb25zLmpzXHJcblxyXG4vLyBNb2R1bGVzXHJcbi8vPSBfaW5pdC5qc1xyXG4vLz0gX3ByZWxvYWRlci5qc1xyXG4vLz0gX2tleWJvYXJkLmpzXHJcbi8vPSBfYmFja2dyb3VuZC5qc1xyXG4vLz0gX2NvbnRyb2xzLmpzXHJcbi8vPSBfcGxheWVyLmpzXHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbigpe1xyXG4gIC8vSW5pdFxyXG4gIFNTLmluaXQoKTtcclxuXHJcbiAgLy8gaW5mb1xyXG4gIHdpbmRvdy5pbmZvLm9uY2xpY2sgPSBmdW5jdGlvbihlKXtcclxuICAgIGlmKFsnYnV0dG9uJywgJ2JhY2tncm91bmQnXS5pbmRleE9mKGUudGFyZ2V0LmNsYXNzTmFtZSkgKyAxKVxyXG4gICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ29wZW5lZCcpO1xyXG4gIH1cclxuICB3aW5kb3cub25rZXlkb3duID0gKGUpID0+IFNTLmtleWJvYXJkKGUpO1xyXG59KTtcclxuIl19
