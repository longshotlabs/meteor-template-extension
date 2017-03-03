Template.prototype.replaces = function replaces(otherTemplate) {
  var self = this;

  function replaceRender(template) {
    // String template names can be provided and template object is looked up
    if (typeof template === 'string') template = Template[template];
    if (!template) return;

    template.renderFunction = self.renderFunction;
  }

  // Accept an array as otherTemplate argument
  if (Array.isArray(otherTemplate)) {
    otherTemplate.forEach(replaceRender);
    return;
  }

  replaceRender(otherTemplate);
};
