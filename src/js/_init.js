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
