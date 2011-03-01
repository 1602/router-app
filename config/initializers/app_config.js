// Load config
global.config = app.config = require('yaml').eval(
    require('fs')
    .readFileSync(app.root + '/config/app_config.yml')
    .toString()
)[app && app.settings && app.settings.env || 'development'];
