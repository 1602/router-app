function Session () {
    this.email = '';
    this.password = '';
}

module.exports = {
    'new': function (req, next) {
        next('render', {
            title: 'Sign in',
            session: new Session
        });
    },
    'destroy': function (req, next) {
        delete req.session.user_id;
        req.flash('You are successfully logged out');
        next(req.xhr ? 'send' : 'redirect', '"' + path_to.new_session + '"');
    },
    'create': function (req, next) {
        User.authenticate(req.body.email, req.body.password, function (success, user) {
            if (success) {
                req.session.user_id = user.id;
                next('redirect', '/');
            } else {
                req.flash('error', 'Can not authenticate user with given credentials');
                next('redirect', path_to.new_session);
            }
        });
    }
};
