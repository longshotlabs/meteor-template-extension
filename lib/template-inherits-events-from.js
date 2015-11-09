Template.prototype.inheritsEventsFrom = function inheritsEventsFrom(otherTemplate) {
  var self = this;

  self.__eventMaps = self.__eventMaps || [];

  function inheritEvents(template) {
    // String template names can be provided and template object is looked up
    if (typeof template === 'string') template = Template[template];
    if (!template) return;

    self.__eventMaps = self.__eventMaps.concat(template.__eventMaps);
  }

  // Accept an array as otherTemplate argument
  if (_.isArray(otherTemplate)) {
    _.each(otherTemplate, inheritEvents);
  } else { //otherTemplate is a string
    inheritEvents(otherTemplate);
  }
};
