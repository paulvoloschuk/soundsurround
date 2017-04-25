"use strict";

window.vmin = function(value){
  let c = (document.documentElement.clientWidth > document.documentElement.clientHeight)
    ? document.documentElement.clientHeight / 100
    : document.documentElement.clientWidth / 100;
  return c * value;
}
window.reverse = function(value){
  return 100 - value;
}
console.log(vmin(1));

window.onload = function(){
  // m_Menu
  this.menu = {
    items: Array.from(document.querySelector('.menu').children),
    focus: false,
    appear: function(){
      this.items.forEach((item, i) => {
        // eventhandlers
        item.firstElementChild.onclick = function(e){
          menu.activate(this);
        }
        item.firstElementChild.onmouseover = function(){
          menu.focus = this;
          menu.items.forEach((item) => {
            if (item.firstElementChild == menu.focus)
              item.firstElementChild.classList.add('focus');
            else
              item.firstElementChild.classList.remove('focus');
          });
          background.replace(this.parentElement.classList[1]);
        }
        // animation
        item.order = i;
        setTimeout(function(){
          let items = this.parentElement.children,
              rotateValue = 360 / items.length * this.order,
              list = this.querySelector('.list');
          for (var i = 0; i < items.length; i++)
            if (i >= this.order)
              items[i].style.transform = ' rotate(' + rotateValue + 'deg)';
          list.style.transform = getComputedStyle(list).transform + ' rotate(' + rotateValue*-1 + 'deg)';
          list.classList.add('enabled');
        }.bind(item), i*200)
      })
    },
    activate: function(list){
      this.items.forEach((item, i) => {
        item.firstElementChild.classList.add((item.firstElementChild !== list)? 'out':'active');
      });
      document.body.classList.add('soundmode');
      controls.generate(list.parentElement.classList[1]);
    },
    deactivate: function(){
      this.items.forEach((item, i) => {
        item.firstElementChild.classList.remove('out', 'active');
      });
      document.body.classList.remove('soundmode');
      setTimeout(function(){
        this.controls.innerHTML =
        this.gooze.innerHTML = '';
      }.bind(controls.container), 300);
    }
  }

  // m_Background
  this.background = {
    container: document.querySelector('.background'),
    current: false,
    images: (function(){
      return window.menu.items.map((item) => {
        let image = new Image();
        image.src = '/img/bg/' + item.classList[1] + '.jpg';
        return image;
      });
    })(),
    replace: function(name){
      if (!!(this.container.firstElementChild.style.backgroundImage.indexOf(name) + 1))
        return;
      let image = document.createElement('div');
      image.className = 'image';
      image.style.backgroundImage = 'url(/img/bg/' + name + '.jpg)';
      this.container.appendChild(image);
      setTimeout(function(){
        Array.from(this.children).forEach(function(item, i){
          if(i < item.parentElement.children.length - 1)
            item.remove();
        });
      }.bind(this.container),300);
    }
  }

  // m_Controls
  this.controls = {
    container: {
      controls: document.querySelector('.actions .container'),
      gooze: document.querySelector('.gooze .container')
    },
    icons: [],
    generate: function(scheme){
      player.config[scheme].forEach((item, i) => {
        let orbit = document.createElement('div'),
            input = document.createElement('input'),
            icon = document.createElement('div');
        orbit.style.transform = 'rotate(' + (360 / player.config[scheme].length * i) + 'deg)';
        icon.style.transform = 'rotate(' + (360 / player.config[scheme].length * i * -1) + 'deg)';
        icon.style.left = (vmin(reverse(item.value) / 10) - vmin(5 * reverse(item.value) / 100)) + 'px';
        icon.innerHTML = '&#xf' + player.config[scheme][i].icon + ';';
        icon.appendChild(document.createElement('span'));
        icon.firstElementChild.innerHTML = item.value + '%';
        input.className = item.name;
        input.setAttribute('value', reverse(item.value))
        input.type = 'range';
        input.oninput = function(){
          document.querySelector('.gooze .' + this.className).value = this.value;
          this.nextSibling.style.left = (vmin(this.value / 10) - vmin(5 * this.value / 100)) + 'px';
          this.nextSibling.firstElementChild.innerHTML = reverse(this.value) + '%';
        }
        orbit.appendChild(input);
        orbit.appendChild(icon);
        orbit.className = 'orbit';
        controls.container.controls.appendChild(orbit);
      });
      controls.container.gooze.innerHTML = controls.container.controls.innerHTML;
    }
  }

  // m_Player
  this.player = {
    config: {
      rain: [
        {
          value: 60,
          name: 'drops',
          icon: 102
        },
        {
          value: 80,
          name: 'lightnings',
          icon: 103
        },
        {
          value: 10,
          name: 'falls',
          icon: 101
        },
        {
          value: 80,
          name: 'wind',
          icon: '10b'
        }
      ],
      forest: [
        {
          value: 60,
          name: 'birds',
          icon: 105
        },
        {
          value: 30,
          name: 'water',
          icon: 104
        },
        {
          value: 10,
          name: 'camp',
          icon: 109
        }
      ],
      sea: [
        {
          value: 10,
          name: 'waves',
          icon: 108
        },
        {
          value: 15,
          name: 'birds',
          icon: 106
        },
        {
          value: 20,
          name: 'rocks',
          icon: 107
        }
      ],
      village: [
        {
          value: 20,
          name: 'common',
          icon: '109'
        },
        {
          value: 20,
          name: 'cock',
          icon: '10c'
        },
        {
          value: 10,
          name: 'animals',
          icon: '10a'
        }
      ],
      desert: [
        {
          value: 80,
          name: 'wind',
          icon: '10b'
        }
      ]
    }
  }

  // Init
  document.getElementsByClassName('deactivate')[0].onclick = function(){
    menu.deactivate();
  }
  menu.appear();
}
