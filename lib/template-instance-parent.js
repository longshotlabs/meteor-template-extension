/**
 * @param selector Can be a height or a function.
 *        Height. The number of levels beyond the current template instance to look.
 *        Defaults to 0.
 *
 *        Function that is given a template as we traverse up the template true. It is passed the template
 *        currently being traversed. If it returns true, then that template is returned, otherwise next is used. This
 *        is done till we hit a template with no parent, in which case null is returned.
 * @param includeBlockHelpers True to include block helpers.
 * @returns {*}
 */
Blaze.TemplateInstance.prototype.parent = function parent(selector, includeBlockHelpers) {
  let template = null;
  if (_.isFinite(selector) || !selector) {
    // If height is null or undefined, we default to 1, the first parent.
    var height = !selector ? 1 : selector;
    template = parentByHeight.call(this, height, includeBlockHelpers);
  } else if (_.isFunction(selector)) {
    template = parentByHeight.call(this, Number.MAX_VALUE, includeBlockHelpers, selector);
  } else {
    throw "template:children Template.parent() is given an invalid selector type."
  }

  return template;
};

// Access parent template instance. "height" is the number of levels beyond the
// current template instance to look. By default block helper template instances
// are skipped, but if "includeBlockHelpers" is set to true, they are not.
// See https://github.com/meteor/meteor/issues/3071
function parentByHeight(height, includeBlockHelpers, selector) {
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

    if (!!selector && !!selector(template)) { return template; }

    i++;
  }
  return template;
}

function parentView(view, includeBlockHelpers) {
  if (includeBlockHelpers) return view.originalParentView || view.parentView;
  return view.parentView;
}

