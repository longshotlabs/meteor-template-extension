Package.describe({
  name: "aldeed:template-extension",
  summary: "Adds template features currently missing from the templating package",
  version: "3.1.0",
  git: "https://github.com/aldeed/meteor-template-extension.git"
});

Package.on_use(function(api) {
  api.use([
    'templating@1.0.0',
    'blaze@2.0.0'
  ]);

  api.add_files(['template-extension.js'], 'client');
});
