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

## Prerequisites

Requires Meteor 0.9.3+

## Installation

```bash
$ meteor add aldeed:template-extension
```

## Template.forEach(callback)

Call `callback` once for each defined template. Generally, you'll want to call this in a `Meteor.startup` function or sometime after all templates have been loaded.

## Template.onCreated / Template.onRendered / Template.onDestroyed

Run a function whenever *any* template is created/rendered/destroyed.

```js
Template.onRendered(function () {
  // Initialize all datepicker inputs whenever any template is rendered
  this.$('.datepicker').datepicker();
});
```

## hooks(options)

Use this instead of setting created/rendered/destroyed property directly. You can call it multiple times to attach multiple hooks to the same template.

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
Template.foo.bar = function () {
  return "TEST";
};

Template.foo.events({
  'click button': function (event, template) {
    console.log("foo button clicked");
  }
});

Template.foo2.replaces("foo");
```

Whenever `{{> foo}}` is used, the contents of the `foo2` template will be shown instead. The `bar` helper defined on "foo" will be used to resolve `{{bar}}`. Clicking the button will still fire the event defined on "foo".

This is useful when a package you are using defines a template for something and you'd like to adjust some things in that template for your app.

## inheritsHelpersFrom(templateName) and inheritsEventsFrom(templateName)

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
```

In this example, both templates are rendered. Both use the `bar` helper defined on "foo" to resolve `{{bar}}`. Both fire the click event defined on "foo".

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

Template.abstract_foo.copyAs('foo');
Template.abstract_foo.copyAs('bar');

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

In this example, we defined "foo" and "bar" templates that get their HTML markup, events, and helpers from a base template, `abstract_foo`. We then override the `images` helper for "foo" and "bar" to provide template-specific images provided by different Meteor methods.

## Contributors

* @aldeed ([Support via Gratipay](https://gratipay.com/aldeed/))
* @grabbou
