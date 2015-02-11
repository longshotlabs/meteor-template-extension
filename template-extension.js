var hookTypes = ["created", "rendered", "destroyed"];
var globalHooks = {created: [], rendered: [], destroyed: []};
var templateHooks = {created: {}, rendered: {}, destroyed: {}};

// Setup for multiple hooks support
// We assume that no other code will be directly defining
// a hook once the client has started.
Meteor.startup(function () {
  Template.forEach(function (template) {
    //For each hookType, define the hooks for this template
    _.each(hookTypes, function (type) {
      defineHook(template, type);
    });
  });
});

Template.forEach = function (callback) {
  // for some reason we get the "body" template twice when looping, so
  // we track that and only call the callback once.
  var alreadyDidBody = false;
  for (var t in Template) {
    if (Template.hasOwnProperty(t)) {
      var tmpl = Template[t];
      if (Blaze.isTemplate(tmpl)) {
        if (tmpl.viewName === "body") {
          if (!alreadyDidBody) {
            alreadyDidBody = true;
            callback(tmpl);
          }
        } else {
          callback(tmpl);
        }
      }
    }
  }
};

Template.onCreated = function (callback) {
  globalHooks.created.push(callback);
};

Template.onRendered = function (callback) {
  globalHooks.rendered.push(callback);
};

Template.onDestroyed = function (callback) {
  globalHooks.destroyed.push(callback);
};

Template.prototype.hooks = function (hooks) {
  var self = this;

  if (typeof hooks !== "object") {
    throw new Error("hooks argument must be an object with created, rendered, and/or destroyed properties, each set to a function");
  }

  var name = parseName(self.viewName);

  // Store a reference to the hooks so they can be called by our own
  // already defined callbacks
  var i, type;
  for (i = hookTypes.length - 1; i >= 0; i--) {
    type = hookTypes[i];
    if (typeof hooks[type] === "function") {
      templateHooks[type][name] = templateHooks[type][name] || [];
      templateHooks[type][name].push(hooks[type]);
    }
  }
};

Template.prototype.replaces = function (replacedTemplateName) {
  var self = this;
  var name = parseName(self.viewName);

  var replaceRender = function (templateName) {
    var replacedTemplate = Template[templateName];

    if (!replacedTemplate) {
      console.warn("Can't replace template " + templateName + " because it hasn't been defined yet.");
      return;
    }

    replacedTemplate.renderFunction = Template[name].renderFunction;
  };

  // Allow this method to be called with an array or a string
  if (_.isArray(replacedTemplateName)) {
    // If called with array, iterate over the template names
    _.each(replacedTemplateName, function (templateName) {
      replaceRender(templateName);
    });
  } else {
    replaceRender(replacedTemplateName);
  }
};

Template.prototype.inheritsHelpersFrom = function (otherTemplateName) {
  var self = this;
  var name = parseName(self.viewName);
  var thisTemplate = Template[name];

  var inheritHelpers = function (templateName) {
    var otherTemplate = Template[templateName];
    if (!otherTemplate) {
      console.warn("Can't inherit helpers from template " + templateName + " because it hasn't been defined yet.");
      return;
    }

    if (otherTemplate.__helpers) {
      thisTemplate.__helpers = $.extend({}, thisTemplate.__helpers, otherTemplate.__helpers);
    }

    else {
      // backwards compatibility; pre-0.9.4 Meteor
      for (var h in otherTemplate) {
        if (otherTemplate.hasOwnProperty(h) && (h.slice(0, 2) !== "__") && h !== "viewName" && h !== "renderFunction") {
          thisTemplate[h] = otherTemplate[h];
        }
      }
    }
  };

  //Accept an array as otherTemplateName argument
  if (_.isArray(otherTemplateName)) {
    _.each(otherTemplateName, function (name) {
      inheritHelpers(name);
    });
  } else { //otherTemplateName is a string
    inheritHelpers(otherTemplateName);
  }
};

Template.prototype.inheritsEventsFrom = function (otherTemplateName) {
  var self = this;

  var name = parseName(self.viewName);

  var inheritEvents = function (templateName) {
    // Check for existence of templateName template
    var otherTemplate = Template[templateName];
    if (!otherTemplate) {
      console.warn("Can't inherit events from template " + templateName + " because it hasn't been defined yet.");
      return;
    }
    // Inherit events
    _.each(otherTemplate.__eventMaps, function (event) {
      Template[name].__eventMaps.push(event);  
    });
  };

  //Accept an array as otherTemplateName argument
  if (_.isArray(otherTemplateName)) {
    _.each(otherTemplateName, function (name) {
      inheritEvents(name);
    });
  } else { //otherTemplateName is a string
    inheritEvents(otherTemplateName);
  }
};

Template.prototype.inheritsHooksFrom = function (otherTemplateName) {
  var self = this;
  var name = parseName(self.viewName);

  var inheritHooks = function(templateName) {
    // Check for existence of templateName template
    var otherTemplate = Template[templateName];
    if (!otherTemplate) {
      console.warn("Can't inherit hooks from template " + templateName + " because it hasn't been defined yet.");
      return;
    }
    // For each hookType check if there are existing templateHooks for templateName
    _.each(hookTypes, function (type) {
      var hooks = templateHooks[type][templateName];
      // For each existing hook for templateName
      _.each(hooks, function (hook) {
        // Initialize the target template's templateHooks array
        templateHooks[type][name] = templateHooks[type][name] || [];
        // Add hook
        templateHooks[type][name].push(hook);
      });
    });
  };

  //Accept an array as otherTemplateName argument
  if (_.isArray(otherTemplateName)) {
    _.each(otherTemplateName, function (name) {
      inheritHooks(name);
    });
  } else { //otherTemplateName is a string
    inheritHooks(otherTemplateName);
  }
};

Template.prototype.copyAs = function (newTemplateName) {
  var self = this, result = [];
  
  var createNewTemplate = function (templateName) {
    var newTemplate =
    Template[templateName] = new Template('Template.' + templateName, self.renderFunction);

    // Run this new template through defineHook, to manage hooks like
    // all other new templates
    _.each(hookTypes, function (type) {
      defineHook(newTemplate, type);
    });

    var name = parseName(self.viewName);
    newTemplate.inheritsHelpersFrom(name);
    newTemplate.inheritsEventsFrom(name);
    newTemplate.inheritsHooksFrom(name);

    return newTemplate;
  };

  //Check if newTemplateName is an array
  if (_.isArray(newTemplateName)) {
    _.each(newTemplateName, function (name) {
      var template = createNewTemplate(name);
      //Push newly created template into array that we'll return
      result.push(template);
    });
    return result;
  } else { //newTemplateName is a string
    var template = createNewTemplate(newTemplateName);
    //return newly created array
    return template;
  }
};

// Allow easy access to a template instance field when you do not know exactly
// on which instance (this, or parent, or parent's parent, ...) a field is defined.
// This allows easy restructuring of templates in HTML, moving things to included
// templates without having to change everywhere in the code instance levels.
// It also allows different structures of templates, when once template is included
// at one level, and some other time at another. Levels do not matter anymore, just
// that the field exists somewhere.
Blaze.TemplateInstance.prototype.get = function (fieldName) {
  var template = this;

  while (template) {
    if (fieldName in template) {
      return template[fieldName];
    }
    template = template.parent(1, true);
  }
};

// Access parent template instance. "height" is the number of levels beyond the
// current template instance to look. By default block helper template instances
// are skipped, but if "includeBlockHelpers" is set to true, they are not.
// See https://github.com/meteor/meteor/issues/3071
Blaze.TemplateInstance.prototype.parent = function(height, includeBlockHelpers) {
  // If height is null or undefined, we default to 1, the first parent.
  if (height == null) {
    height = 1;
  }

  var i = 0;
  var template = this;
  while (i < height && template) {
    var view = parentView(template.view, includeBlockHelpers);
    // We skip contentBlock views which are injected by Meteor when using
    // block helpers (in addition to block helper view). This matches more
    // the visual structure of templates and not the internal implementation.
    while (view && (!view.template || view.name === '(contentBlock)')) {
      view = parentView(view, includeBlockHelpers);
    }
    if (!view) {
      return null;
    }
    // Body view has template field, but not templateInstance,
    // which more or less signals that we reached the top.
    template = typeof view.templateInstance === 'function' ? view.templateInstance() : null;
    i++;
  }
  return template;
};

// Allow to specify a function to test parent data for at various
// levels, instead of specifying a fixed number of levels to traverse.
var originalParentData = Blaze._parentData;
Blaze._parentData = function (height, _functionWrapped) {
  // If height is not a function, simply call original implementation.
  if (typeof height !== 'function') {
    return originalParentData(height, _functionWrapped);
  }

  var theWith = Blaze.getView('with');
  var test = function () {
    return height(theWith.dataVar.get());
  };
  while (theWith) {
    if (Tracker.nonreactive(test)) break;
    theWith = Blaze.getView(theWith, 'with');
  }

  // _functionWrapped is internal and will not be
  // specified with non numeric height, so we ignore it.
  if (!theWith) return null;
  // This registers a Tracker dependency.
  return theWith.dataVar.get();
};

Template.parentData = Blaze._parentData;

/* PRIVATE */

function defineHook(template, type) {
  // see if there's an existing callback set directly on the template instance
  var orig = template[type];

  // Basically scraping callbacks set directly on instance and saving
  // in templateHooks
  if (typeof orig === 'function') {
    var name = parseName(template.viewName);
    templateHooks[type][name] = templateHooks[type][name] || [];
    templateHooks[type][name].push(orig);
  }

  // set our own callback directly on the template instance
  template[type] = function () {
    //console.log(type, orig);
    // call all defined global hooks
    runGlobalHooks(type, this, arguments);
    // call all defined hooks for this template instance
    runTemplateHooks(type, this, arguments);
  };
};

function parentView(view, includeBlockHelpers) {
  if (includeBlockHelpers) {
    return view.originalParentView || view.parentView;
  }
  else {
    return view.parentView;
  }
}

function parseName(name) {
  if (!name) {
    return
  }
  // post 0.9.1 kludge to get template name from viewName
  var prefix = 'Template.';
  if (name.indexOf(prefix) === 0) {
    return name.slice(prefix.length);
  }
  return name;
}

function runGlobalHooks(type, template, args) {
  var i, h = globalHooks[type], hl = h.length;
  for (i = 0; i < hl; i++) {
    h[i].apply(template, args);
  }
}

function runTemplateHooks(type, template, args) {
  var i, name = parseName(template.viewName) || parseName(template.view.name), h = templateHooks[type][name];
  var hl = h ? h.length : 0;
  for (i = 0; i < hl; i++) {
    h[i].apply(template, args);
  }
}
