Template.prototype.inheritsHooksFrom = function inheritsHooksFrom(otherTemplate) {
  var self = this;

  function inheritHooks(template) {
    // String template names can be provided and template object is looked up
    if (typeof template === 'string') template = Template[template];
    if (!template) return;

    // For this to work properly, need to ensure that we've defined
    // the global hook hook for the other template already.
    Hooks.addGlobal(template);

    for (let hook of template._callbacks.created) {
      // Don't copy the master hook because every template already has it
      if (hook === Hooks.master.created) continue;
      self.onCreated(hook);
    }

    for (let hook of template._callbacks.rendered) {
      // Don't copy the master hook because every template already has it
      if (hook === Hooks.master.rendered) continue;
      self.onRendered(hook);
    }

    for (let hook of template._callbacks.destroyed) {
      // Don't copy the master hook because every template already has it
      if (hook === Hooks.master.destroyed) continue;
      self.onDestroyed(hook);
    }
  }

  // Accept an array as otherTemplate argument
  if (_.isArray(otherTemplate)) {
    _.each(otherTemplate, inheritHooks);
  } else { //otherTemplate is a string
    inheritHooks(otherTemplate);
  }
};
