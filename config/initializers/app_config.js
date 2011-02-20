// Load config
global.config = app.config = require('yaml').eval(
    require('fs')
    .readFileSync(root_dir + '/config/app_config.yml')
    .toString()
)[app.settings.env];
