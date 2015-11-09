Template.prototype.inheritsHelpersFrom = function inheritsHelpersFrom(otherTemplate) {
  var self = this;

  function inheritHelpers(template) {
    // String template names can be provided and template object is looked up
    if (typeof template === 'string') template = Template[template];
    if (!template) return;

    let inheritedHelpers = {};
    _.each(template.__helpers, (helper, name) => {
      if (name.charAt(0) === " ") inheritedHelpers[name.slice(1)] = helper;
    });

    self.helpers(inheritedHelpers);
  }

  // Accept an array as otherTemplate argument
  if (_.isArray(otherTemplate)) {
    _.each(otherTemplate, inheritHelpers);
  } else { //otherTemplate is a string
    inheritHelpers(otherTemplate);
  }
};
