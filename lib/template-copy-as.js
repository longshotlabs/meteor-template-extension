Template.prototype.copyAs = function copyAs(newTemplateName) {
  var self = this;

  function createNewTemplate(templateName) {
    var newTemplate =
    Template[templateName] = new Template(`Template.${templateName}`, self.renderFunction);

    newTemplate.inheritsHelpersFrom(self);
    newTemplate.inheritsEventsFrom(self);
    newTemplate.inheritsHooksFrom(self);

    return newTemplate;
  }

  // Check if newTemplateName is an array
  if (Array.isArray(newTemplateName)) {
    const result = [];
    for (let name of newTemplateName) {
      result.push(createNewTemplate(name));
    }
    return result;
  }

  // newTemplateName is a string
  return createNewTemplate(newTemplateName);
};
