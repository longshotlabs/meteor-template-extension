Package.describe({
  name: "aldeed:template-extension",
  summary: "Adds template features currently missing from the templating package",
  version: "3.1.1",
  git: "https://github.com/aldeed/meteor-template-extension.git"
});

Package.on_use(function(api) {
  api.versionsFrom('METEOR@1.0');
  api.use([
    'templating',
    'blaze',
    'jquery',
    'tracker'
  ], 'client');

  api.add_files(['template-extension.js'], 'client');
});

Package.on_test(function(api) {
  api.use([
    'aldeed:template-extension',
    'templating',
    'tinytest',
    'test-helpers',
    'ejson'
  ], 'client');

  api.add_files(['tests.html', 'tests.js'], 'client');
});
