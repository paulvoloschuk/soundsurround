"use strict";

let SS = SS || {};

// functions
//= _functions.js

// Modules
//= _init.js
//= _preloader.js
//= _keyboard.js
//= _background.js
//= _controls.js
//= _player.js

document.addEventListener("DOMContentLoaded", function(){
  //Init
  SS.init();

  // info
  window.info.onclick = function(e){
    if(['button', 'background'].indexOf(e.target.className) + 1)
      this.classList.toggle('opened');
  }
  window.onkeydown = (e) => SS.keyboard(e);
});
