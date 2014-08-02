Package.describe({
  name: "template-extension",
  summary: "Replace already defined templates, inherit helpers and events from other templates"
});

Package.on_use(function(api) {
  api.use(['templating']);
  api.add_files(['template-extension.js'], 'client');
});