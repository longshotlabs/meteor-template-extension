// Allow easy setting of template instance's parent (or ancestor) field

Blaze.TemplateInstance.prototype.set = function set(fieldName, value) {
  var template = this;

  while (template) {
    if (fieldName in template) {
      var previousValue = template[fieldName];
      if (Package['reactive-var']) {
        template[fieldName].set(value);
      } else {
        template[fieldName] = value;
      }
      return previousValue;
    }
    template = template.parent(1, true);
  }
};
