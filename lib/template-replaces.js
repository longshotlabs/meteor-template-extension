Template.prototype.replaces = function replaces(otherTemplate) {
  var self = this;

  function replaceRender(template) {
    // String template names can be provided and template object is looked up
    if (typeof template === 'string') template = Template[template];
    if (!template) return;

    template.renderFunction = self.renderFunction;
  }

  // Accept an array as otherTemplate argument
  if (_.isArray(otherTemplate)) {
    _.each(otherTemplate, replaceRender);
  } else {
    replaceRender(otherTemplate);
  }
};
