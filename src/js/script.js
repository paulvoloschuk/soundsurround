"use strict";
window.onload = function(){
  // m_Menu
  this.menu = {
    items: Array.from(document.querySelector('.menu').children),
    appear: function(){
      this.items.forEach((item, i) => {
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
        }.bind(item), i*500)
      })
    },
    activate: function(){
      // My next step
    },
    deactivate: function(){

    }
  }
  console.log(menu);
}
