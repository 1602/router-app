function Session () {
    this.email = '';
    this.password = '';
}

module.exports = {
    'new': function (req, next) {
        console.log(req.session);
        var flash = req.session.flash;
        if (flash) {
            delete req.session.flash;
        }
        next('render', {
            title: 'Sign in',
            message: flash,
            session: new Session
        });
    },
    'destroy': function (req, next) {
        delete req.session.user_id;
        //req.session.flash = 'You are successfully logged out';
        next(req.xhr ? 'send' : 'redirect', '"' + path_to.new_session + '"');
    },
    'create': function (req, next) {
        User.authenticate(req.body.email, req.body.password, function (success, user) {
            if (success) {
                req.session.user_id = user.id;
                next('redirect', '/');
            } else {
                req.session.flash = 'Can not authenticate user with given credentials: ' + user;
                next('redirect', path_to.new_session);
            }
        });
    }
};
