Template.prototype.replaces = function (replacedTemplateName) {
  var self = this;

  var replacedTemplate = Template[replacedTemplateName];

  if (!replacedTemplate) {
    console.warn("Can't replace template " + replacedTemplateName + " because it hasn't been defined yet.");
    return;
  }

  var name = parseName(self.viewName);
  replacedTemplate.renderFunction = Template[name].renderFunction;
};

Template.prototype.inheritsHelpersFrom = function (otherTemplateName) {
  var self = this;

  var otherTemplate = Template[otherTemplateName];
  if (!otherTemplate) {
    console.warn("Can't inherit helpers from template " + otherTemplateName + " because it hasn't been defined yet.");
    return;
  }

  var name = parseName(self.viewName);
  var thisTemplate = Template[name];
  for (var h in otherTemplate) {
    if (otherTemplate.hasOwnProperty(h) && (h.slice(0, 2) !== "__") && h !== "viewName" && h !== "renderFunction") {
      thisTemplate[h] = otherTemplate[h];
    }
  }
};

Template.prototype.inheritsEventsFrom = function (otherTemplateName) {
  var self = this;

  var otherTemplate = Template[otherTemplateName];
  if (!otherTemplate) {
    console.warn("Can't inherit events from template " + otherTemplateName + " because it hasn't been defined yet.");
    return;
  }

  var name = parseName(self.viewName);
  Template[name].__eventMaps = otherTemplate.__eventMaps;
};

Template.prototype.copyAs = function (newTemplateName) {
  var self = this;

  var newTemplate =
  Template[newTemplateName] = new Template('Template.' + newTemplateName, self.renderFunction);

  var name = parseName(self.viewName);
  newTemplate.inheritsHelpersFrom(name);
  newTemplate.inheritsEventsFrom(name);
};

/* PRIVATE */

function parseName(name) {
  // post 0.9.1 kludge to get template name from viewName
  return name.replace('Template.','');
}