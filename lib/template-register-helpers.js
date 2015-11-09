Template.registerHelpers = (helpers) => {
  if (!helpers) return;

  for (let name in helpers) {
    if (helpers.hasOwnProperty(name)) {
      Template.registerHelper(name, helpers[name]);
    }
  }
};
