template-extension
=========================

WORK IN PROGRESS

A smart package for Meteor that allows you to:

* override a template but keep it's helpers and events.
* inherit the helpers from another template.
* inherit the events from another template.

## Prerequisites

Requires Meteor 0.8.3+

## Installation

Work in progress. For now, not on Atmosphere. Put this in the packages section of your smart.json:

```
"template-extension": {
  "git": "https://github.com/aldeed/meteor-template-extension",
  "branch": "master"
}
```

And then run `mrt add template-extension`

## replacesTemplate

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

Template.foo2.replacesTemplate("foo");
```

Whenever `{{> foo}}` is used, the contents of the `foo2` template will be shown instead. The `bar` helper defined on "foo" will be used to resolve `{{bar}}`. Clicking the button will still fire the event defined on "foo".

This is useful when a package you are using defines a template for something and you'd like to adjust some things in that template for your app.

## inheritsHelpersFromTemplate and inheritsEventsFromTemplate

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

Template.foo2.inheritsHelpersFromTemplate("foo");
Template.foo2.inheritsEventsFromTemplate("foo");
```

In this example, both templates are rendered. Both use the `bar` helper defined on "foo" to resolve `{{bar}}`. Both fire the click event defined on "foo".

[![Support via Gittip](https://rawgithub.com/twolfson/gittip-badge/0.2.0/dist/gittip.png)](https://www.gittip.com/aldeed/)
