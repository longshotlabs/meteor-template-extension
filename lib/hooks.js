Hooks = {
  global: {
    created: [],
    rendered: [],
    destroyed: []
  },
  master: {
    created: function () {
      Hooks.runGlobal('created', this, arguments);
    },
    rendered: function () {
      Hooks.runGlobal('rendered', this, arguments);
    },
    destroyed: function () {
      Hooks.runGlobal('destroyed', this, arguments);
    }
  }
};

Hooks.addGlobal = (template) => {
  // For each hookType, define the hooks for this template.
  // Since we might call this multiple times from startup code
  // and other functions, make sure we do it only once.
  // Doing it twice would create an infinite loop of self-calling
  // hooks.
  if (!template._hasTemplateExtensionMasterHooks) {
    template.onCreated(Hooks.master.created);
    template.onRendered(Hooks.master.rendered);
    template.onDestroyed(Hooks.master.destroyed);

    template._hasTemplateExtensionMasterHooks = true;
  }
};

Hooks.runGlobal = (type, template, args) => {
  for (let hook of Hooks.global[type]) {
    hook.apply(template, args);
  }
};
