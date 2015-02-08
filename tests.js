var testingInstanceGet = false;
var testingInstanceParent = false;
var testingData = false;

Template.noop.created = function () {
  this._testTemplateFieldNoop = 50;
};

Template.testTemplate.created = function () {
  this._testTemplateField = 42;
};

Template.testTemplate.helpers({
  data: function () {
    return _.extend({}, this, {data1: 'foo'});
  }
});

Template.testTemplate1.created = function () {
  this._testTemplateField1 = 43;
};

Template.testTemplate1.helpers({
  data: function () {
    // We add data2, but remove data1.
    return _.omit(_.extend({}, this, {data2: 'bar'}), 'data1');
  }
});

Template.testTemplate2.created = function () {
  this._testTemplateField3 = 44;
};

Template.testTemplate2.helpers({
  testInstanceGet: function () {
    if (testingInstanceGet) return EJSON.stringify(Template.instance().get(this.fieldName));
  },

  testInstanceParent: function () {
    if (!testingInstanceParent) return;

    var ancestors = [];
    var template = Template.instance();
    while (template) {
      // Only fields which start with _.
      ancestors.push(_.pick(template, _.filter(_.keys(template), function (key) {return key.substr(0, 1) === '_';})));
      template = template.parent(this.numLevels, this.includeBlockHelpers);
    }
    return EJSON.stringify(ancestors);
  },

  testData: function () {
    if (testingData) return EJSON.stringify(Template.parentData(this.numLevels));
  }
});

Tinytest.add('template-extension - get', function (test) {
  testingInstanceGet = true;
  try {
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_testTemplateField'}), '42');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_testTemplateField1'}), '43');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_testTemplateField3'}), '44');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_testTemplateFieldNoop'}), '50');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_nonexistent'}), '');
  }
  finally {
    testingInstanceGet = false;
  }
});

Tinytest.add('template-extension - parent', function (test) {
  testingInstanceParent = true;
  try {
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 1, includeBlockHelpers: false}), '[{"_testTemplateField3":44},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 1, includeBlockHelpers: true}), '[{"_testTemplateField3":44},{"_testTemplateFieldNoop":50},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {includeBlockHelpers: false}), '[{"_testTemplateField3":44},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {includeBlockHelpers: true}), '[{"_testTemplateField3":44},{"_testTemplateFieldNoop":50},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: undefined, includeBlockHelpers: false}), '[{"_testTemplateField3":44},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: undefined, includeBlockHelpers: true}), '[{"_testTemplateField3":44},{"_testTemplateFieldNoop":50},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: null, includeBlockHelpers: false}), '[{"_testTemplateField3":44},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: null, includeBlockHelpers: true}), '[{"_testTemplateField3":44},{"_testTemplateFieldNoop":50},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 2, includeBlockHelpers: false}), '[{"_testTemplateField3":44},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 2, includeBlockHelpers: true}), '[{"_testTemplateField3":44},{"_testTemplateField1":43}]');
  }
  finally {
    testingInstanceParent = false;
  }
});

Tinytest.add('template-extension - parentData', function (test) {
  testingData = true;
  try {
    // Testing default behavior.
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {}), '{"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: undefined}), '{"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: null}), '{"numLevels":null,"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 0}), '{"numLevels":0,"data2":"bar"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 1}), '{"numLevels":1,"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 2}), '{"numLevels":2}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 3}), 'null');

    // Testing a function.
    var hasField = function (fieldName) {
      return function (data) {
        return fieldName in data;
      };
    };

    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: hasField('data1')}), '{"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: hasField('data2')}), '{"data2":"bar"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: hasField('data3')}), 'null');
  }
  finally {
    testingData = false;
  }
});
