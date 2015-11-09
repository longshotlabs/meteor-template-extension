// Setup for multiple hooks support
// We assume that no other code will be directly defining
// a hook once the client has started.
Meteor.startup(() => {
  Template.forEach((template) => {
    Hooks.addGlobal(template);
  });
});

Template.onCreated = (hook) => {
  Hooks.global.created.push(hook);
};

Template.onRendered = (hook) => {
  Hooks.global.rendered.push(hook);
};

Template.onDestroyed = (hook) => {
  Hooks.global.destroyed.push(hook);
};
