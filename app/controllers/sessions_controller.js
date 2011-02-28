function Session () {
    this.email = '';
    this.password = '';
}

action('new', function () {
    render({
        title: 'Sign in',
        session: new Session
    });
});

action('destroy', function () {
    delete req.session.user_id;
    flash('info', 'You are successfully logged out');
    send( 'redirect', '"' + path_to.new_session + '"');
});

action('create', function () {
    User.authenticate(req.body.email, req.body.password, function (success, user) {
        if (success) {
            req.session.user_id = user.id;
            redirect(req.session.pendingUUID ? path_to.new_route : '/');
        } else {
            flash('error', 'Can not authenticate user with given credentials: ' + user);
            redirect(path_to.new_session);
        }
    });
});
