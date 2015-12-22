[![Build Status](https://travis-ci.org/aldeed/meteor-template-extension.svg)](https://travis-ci.org/aldeed/meteor-template-extension)

template-extension
=========================

A smart package for Meteor that allows you to:

* iterate over all defined templates easily.
* attach multiple created/rendered/destroyed hooks to a template.
* attach a created/rendered/destroyed hook to all templates.
* override a template but keep its helpers and events.
* inherit the helpers from another template.
* inherit the events from another template.
* extend abstract templates and overwrite their events/helpers.
* use `template.parent(numLevels, includeBlockHelpers)` to access a parent template instance.
* use `template.get(fieldName)` to access the first field named `fieldName` in the current or ancestor template instances.
* pass a function to `Template.parentData(fun)` to get the first data context which passes the test.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Installation](#installation)
- [Compatibility](#compatibility)
- [Template.forEach(callback)](#templateforeachcallback)
- [Template.forEachCurrentlyRenderedInstance(callback)](#templateforeachcurrentlyrenderedinstancecallback)
- [Template.onCreated / Template.onRendered / Template.onDestroyed](#templateoncreated--templateonrendered--templateondestroyed)
- [hooks(options)](#hooksoptions)
- [replaces(templateName)](#replacestemplatename)
- [inheritsHelpersFrom(templateName), inheritsEventsFrom(templateName), and inheritsHooksFrom(templateName)](#inheritshelpersfromtemplatename-inheritseventsfromtemplatename-and-inheritshooksfromtemplatename)
- [clearEventMaps()](#cleareventmaps)
- [copyAs(newTemplateName)](#copyasnewtemplatename)
- [templateInstance.parent(numLevels, includeBlockHelpers)](#templateinstanceparentnumlevels-includeblockhelpers)
- [templateInstance.get(fieldName)](#templateinstancegetfieldname)
- [Template.parentData(fun)](#templateparentdatafun)
- [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```bash
$ meteor add aldeed:template-extension
```

## Compatibility

- Use a 3.x.x release with Meteor 1.0.x or Meteor 1.1.x
- Use a 4.x.x release with Meteor 1.2+

## Template.forEach(callback)

Call `callback` once for each defined template. Generally, you'll want to call this in a `Meteor.startup` function or sometime after all templates have been loaded.

## Template.forEachCurrentlyRenderedInstance(callback)

Call `callback` once for each template instance that is currently rendered.

## Template.onCreated / Template.onRendered / Template.onDestroyed

Run a function whenever *any* template is created/rendered/destroyed.

```js
Template.onRendered(function () {
  // Initialize all datepicker inputs whenever any template is rendered
  this.$('.datepicker').datepicker();
});
```

## hooks(options)

An alternative syntax to `onCreated`, `onRendered`, and `onDestroyed`.

```js
Template.foo.hooks({
  created: function () {
    console.log("foo created");
  },
  rendered: function () {
    console.log("foo rendered");
  },
  destroyed: function () {
    console.log("foo destroyed");
  }
});
```

## replaces(templateName)

*html*

```html
<body>
  {{> foo}}
</body>

<template name="foo">
  {{bar}}
  <button type="button">Click</button>
</template>

<template name="foo2">
  {{bar}} 2
  <button type="button">Click 2</button>
</template>
```

*client.js*

```js
Template.foo.helpers({
  bar: function () {
    return "TEST";
  }
});

Template.foo.events({
  'click button': function (event, template) {
    console.log("foo button clicked");
  }
});

Template.foo2.replaces("foo");
```

Whenever `{{> foo}}` is used, the contents of the `foo2` template will be shown instead. The `bar` helper defined on "foo" will be used to resolve `{{bar}}`. Clicking the button will still fire the event defined on "foo".

This is useful when a package you are using defines a template for something and you'd like to adjust some things in that template for your app.

NOTE: This simply swaps the render function. Helpers, callbacks, and events assigned to `foo2` will not fire when `{{> foo}}` is used. Only the `foo` helpers, callbacks, and events are used.

## inheritsHelpersFrom(templateName), inheritsEventsFrom(templateName), and inheritsHooksFrom(templateName)

*html*

```html
<body>
  {{> foo}}
  {{> foo2}}
</body>

<template name="foo">
  {{bar}}
  <button type="button">Click</button>
</template>

<template name="foo2">
  {{bar}} 2
  <button type="button">Click 2</button>
</template>
```

*client.js*

```js
Template.foo.bar = function () {
  return "TEST";
};

Template.foo.events({
  'click button': function (event, template) {
    console.log("foo button clicked");
  }
});

Template.foo2.inheritsHelpersFrom("foo");
Template.foo2.inheritsEventsFrom("foo");

Template.foo.created = function () {
  console.log('foo');
};

Template.foo2.inheritsHooksFrom("foo");
```

In this example, both templates are rendered. Both use the `bar` helper defined on "foo" to resolve `{{bar}}`. Both fire the click event defined on "foo". The "foo2" template will inherit the `foo.created` callback and log 'foo' to the console upon creation.

Additionally, these methods can be called with an array of template names: `Template.foo2.inheritsHooksFrom(['foo', 'bar', 'baz']);`

## clearEventMaps()

After `Template.foo.events({...})` has been called one or more times, you can remove all the added event handlers by calling `Template.foo.clearEventMaps()`

## copyAs(newTemplateName)

*html*

```html
<body>
  {{> foo}}
  {{> bar}}
</body>

<template name="abstract_foo">
{{#each images}}
   <img src="{{src}}" alt="{{title}}" />
{{/each}}
</template>
```

*client.js*

```js
Template.abstract_foo.helpers({
    images: function () {
        return [];
    }
});

Template.abstract_foo.copyAs(['foo', 'bar']);

Template.foo.helpers({
    images: function () {
        return Meteor.call('getFooImages');
    }
});

Template.bar.helpers({
    images: function () {
        return Meteor.call('getBarImages');
    }
});
```

In this example, we defined "foo" and "bar" templates that get their HTML markup, events, and helpers from a base template, `abstract_foo`. We then override the `images` helper for "foo" and "bar" to provide template-specific images provided by different Meteor methods. Template.template.copyAs can accept either single template name (in string form), or an array of template names as shown in the above example.

If copyAs is invoked with a string, it returns the newly created template.

If copyAs is invoked with an array, it returns an array of newly created templates.

## templateInstance.parent(numLevels, includeBlockHelpers)

On template instances you can now use `parent(numLevels)` method to access a parent template instance.
`numLevels` is the number of levels beyond the current template instance to look. Defaults to 1.
By default block helper template instances are skipped, but if `includeBlockHelpers` is set to true,
they are not.

## templateInstance.get(fieldName)

To not have to hard-code the number of levels when accessing parent template instances you can use
`get(fieldName)` method which returns the value of the first property named `fieldName` on the current
or ancestor template instances, traversed in the hierarchical order. It traverses block helper template
instances as well. This pattern makes it easier to refactor templates without having to worry about
changes to number of levels.

## Template.parentData(fun)

`Template.parentData` now accepts a function which will be used to test each data context when traversing
them in the hierarchical order, returning the first data context for which the test function returns `true`.
This is useful so that you do not have to hard-code the number of levels when accessing parent data contexts,
but you can use a more logic-oriented approach. For example, search for the first data context which contains
a given field. Or:

```js
var data = Template.parentData(function (data) {return data instanceof MyDocument;});
```

## Contributors

* @aldeed
* @grabbou
* @mitar
* @jgladch
