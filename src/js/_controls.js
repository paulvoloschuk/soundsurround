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
