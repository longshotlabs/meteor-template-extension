Template._renderedInstances = [];

Template.onRendered(function onRendered() {
  Template._renderedInstances.push(this);
});

Template.onDestroyed(function onDestroyed() {
  var i = Template._renderedInstances.indexOf(this);
  if (i > -1) Template._renderedInstances.splice(i, 1);
});

Template.forEachCurrentlyRenderedInstance = (func) => {
  Template._renderedInstances.forEach(func);
};
