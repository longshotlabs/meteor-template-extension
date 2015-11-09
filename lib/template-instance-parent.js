// Access parent template instance. "height" is the number of levels beyond the
// current template instance to look. By default block helper template instances
// are skipped, but if "includeBlockHelpers" is set to true, they are not.
// See https://github.com/meteor/meteor/issues/3071
Blaze.TemplateInstance.prototype.parent = function parent(height, includeBlockHelpers) {
  // If height is null or undefined, we default to 1, the first parent.
  if (height == null) height = 1;

  var i = 0;
  var template = this;
  while (i < height && template) {
    var view = parentView(template.view, includeBlockHelpers);
    // We skip contentBlock views which are injected by Meteor when using
    // block helpers (in addition to block helper view). This matches more
    // the visual structure of templates and not the internal implementation.
    while (view && (!view.template || view.name === '(contentBlock)' || view.name === '(elseBlock)')) {
      view = parentView(view, includeBlockHelpers);
    }
    if (!view) return null;
    // Body view has template field, but not templateInstance,
    // which more or less signals that we reached the top.
    template = typeof view.templateInstance === 'function' ? view.templateInstance() : null;
    i++;
  }
  return template;
};

function parentView(view, includeBlockHelpers) {
  if (includeBlockHelpers) return view.originalParentView || view.parentView;
  return view.parentView;
}
