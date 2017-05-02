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
