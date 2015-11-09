Template.forEach = (callback) => {
  // for some reason we get the "body" template twice when looping, so
  // we track that and only call the callback once.
  var alreadyDidBody = false;
  for (var t in Template) {
    if (Template.hasOwnProperty(t)) {
      var tmpl = Template[t];
      if (Blaze.isTemplate(tmpl)) {
        let name = tmpl.viewName;
        if (name === "body") {
          if (!alreadyDidBody) {
            alreadyDidBody = true;
            callback(tmpl);
          }
        } else if (name !== 'Template.__dynamic' && name !== 'Template.__dynamicWithDataContext') {
          callback(tmpl);
        }
      }
    }
  }
};
