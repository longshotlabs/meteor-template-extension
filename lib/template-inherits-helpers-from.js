Template.prototype.inheritsHelpersFrom = function inheritsHelpersFrom(otherTemplate) {
  const inheritHelpers = template => {
    // String template names can be provided and template object is looked up
    if (typeof template === 'string') template = Template[template];
    if (!template) return;

    const inheritedHelpers = {};
    for (const name in template.__helpers) {
      if (template.__helpers.hasOwnProperty(name)) {
        if (name.charAt(0) === ' ') {
          inheritedHelpers[name.slice(1)] = template.__helpers[name];
        }
      }
    }

    this.helpers(inheritedHelpers);
  };

  // Accept an array as otherTemplate argument
  if (Array.isArray(otherTemplate)) {
    otherTemplate.forEach(inheritHelpers);
    return;
  }

  // otherTemplate is a string
  inheritHelpers(otherTemplate);
};
