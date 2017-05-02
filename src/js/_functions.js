function createElement(name, options){
  let element = document.createElement(name);
  for (let key in options)
    element[key] = options[key];
  return element;
}
