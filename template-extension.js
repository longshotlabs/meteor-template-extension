Template.prototype.replaces = function (replacedTemplateName) {
  var self = this;

  var replacedTemplate = Template[replacedTemplateName];

  if (!replacedTemplate) {
    console.warn("Can't replace template " + replacedTemplateName + " because it hasn't been defined yet.");
    return;
  }
  // post 0.9.1 kludge to get template name from viewName
  var name = self.viewName.replace('Template.','');
  replacedTemplate.renderFunction = Template[name].renderFunction;
};

Template.prototype.inheritsHelpersFrom = function (otherTemplateName) {
  var self = this;

  var otherTemplate = Template[otherTemplateName];
  if (!otherTemplate) {
    console.warn("Can't inherit helpers from template " + otherTemplateName + " because it hasn't been defined yet.");
    return;
  }

  var thisTemplate = Template[self.__templateName];
  for (var h in otherTemplate) {
    if (otherTemplate.hasOwnProperty(h) && (h.slice(0, 2) !== "__")) {
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

  Template[self.__templateName].__eventMaps = otherTemplate.__eventMaps;
};

Template.prototype.copyAs = function (newTemplateName) {
    var self = this;

    var newTemplate = Template.__define__(newTemplateName, self.__render);
    newTemplate.__initView = self.__initView;

    Template[newTemplateName] = newTemplate;

    newTemplate.inheritsHelpersFrom(self.__templateName);
    newTemplate.inheritsEventsFrom(self.__templateName);
};
