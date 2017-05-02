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
