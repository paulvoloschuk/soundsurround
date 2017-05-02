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
