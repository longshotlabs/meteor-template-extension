Template.prototype.hooks = function (hooks) {
  if (!hooks || typeof hooks !== "object") {
    throw new Error("hooks argument must be an object with created, rendered, and/or destroyed properties, each set to a function");
  }

  if (typeof hooks.created === 'function') this.onCreated(hooks.created);
  if (typeof hooks.rendered === 'function') this.onRendered(hooks.rendered);
  if (typeof hooks.destroyed === 'function') this.onDestroyed(hooks.destroyed);
};
