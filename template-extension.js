var hookTypes = ["created", "rendered", "destroyed"];
var globalHooks = {created: [], rendered: [], destroyed: []};
var templateHooks = {created: {}, rendered: {}, destroyed: {}};

// Setup for multiple hooks support
// We assume that no other code will be directly defining
// a hook once the client has started.
Meteor.startup(function () {
  Template.forEach(function (template) {
    var i;

    function defineHook(type) {
      // see if there's an existing callback set directly on the template instance
      var orig = template[type];
      // set our own callback directly on the template instance
      template[type] = function () {
        //console.log(type, orig);
        // call all defined global hooks
        runGlobalHooks(type, this, arguments);
        // call all defined hooks for this template instance
        runTemplateHooks(type, this, arguments);
        // call the existing callback if there was one
        if (typeof orig === "function") {
          orig.apply(this, arguments);
        }
      };
    }

    for (i = hookTypes.length - 1; i >= 0; i--) {
      defineHook(hookTypes[i]);
    };
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
  };
};

Template.prototype.replaces = function (replacedTemplateName) {
  var self = this;

  var replacedTemplate = Template[replacedTemplateName];

  if (!replacedTemplate) {
    console.warn("Can't replace template " + replacedTemplateName + " because it hasn't been defined yet.");
    return;
  }

  var name = parseName(self.viewName);
  replacedTemplate.renderFunction = Template[name].renderFunction;
};

Template.prototype.inheritsHelpersFrom = function (otherTemplateName) {
  var self = this;

  var otherTemplate = Template[otherTemplateName];
  if (!otherTemplate) {
    console.warn("Can't inherit helpers from template " + otherTemplateName + " because it hasn't been defined yet.");
    return;
  }

  var name = parseName(self.viewName);
  var thisTemplate = Template[name];
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

Template.prototype.inheritsEventsFrom = function (otherTemplateName) {
  var self = this;

  var otherTemplate = Template[otherTemplateName];
  if (!otherTemplate) {
    console.warn("Can't inherit events from template " + otherTemplateName + " because it hasn't been defined yet.");
    return;
  }

  var name = parseName(self.viewName);
  Template[name].__eventMaps = otherTemplate.__eventMaps;
};

Template.prototype.copyAs = function (newTemplateName) {
  var self = this;

  var newTemplate =
  Template[newTemplateName] = new Template('Template.' + newTemplateName, self.renderFunction);

  var name = parseName(self.viewName);
  newTemplate.inheritsHelpersFrom(name);
  newTemplate.inheritsEventsFrom(name);
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
    template = template.parent();
  }
};

// Access parent template instance. "height" is the number of levels beyond the
// current template instance to look.
Blaze.TemplateInstance.prototype.parent = function(height) {
  // If height is null or undefined, we default to 1, the first parent.
  if (height == null) {
    height = 1;
  }

  var i = 0;
  var template = this;
  while (i < height && template) {
    var view = template.view.parentView;
    while (view && !view.template) {
      view = view.parentView;
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
  var data = function () {
    return theWith.dataVar.get();
  };
  while (theWith) {
    if (height(Tracker.nonreactive(data))) break;
    theWith = Blaze.getView(theWith, 'with');
  }

  // _functionWrapped is internal and will not be
  // specified with non numeric height, so we ignore it.
  if (!theWith) return null;
  // This registers a Tracker dependency.
  return theWith.dataVar.get();
};

/* PRIVATE */

function parseName(name) {
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
  };
}

function runTemplateHooks(type, template, args) {
  var i, name = parseName(template.view.name), h = templateHooks[type][name];
  var hl = h ? h.length : 0;
  for (i = 0; i < hl; i++) {
    h[i].apply(template, args);
  };
}
