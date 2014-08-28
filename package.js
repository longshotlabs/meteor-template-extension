Package.describe({
  name: "aldeed:template-extension",
  summary: "Replace already defined templates, inherit helpers and events from other templates",
  version: "0.1.0",
  git: "https://github.com/aldeed/meteor-template-extension.git"
});

Package.on_use(function(api) {
  if (api.versionsFrom) {
    api.versionsFrom('METEOR@0.9.0');
  }
  api.use('templating');

  api.add_files(['template-extension.js'], 'client');
});