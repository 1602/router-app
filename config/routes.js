function userRequired (req, res, next) {
    if (!req.user) {
        res.redirect('/session/new');
    } else {
        next();
    }
}

exports.routes = function (map) {
    map.resources('users', {only: ['new', 'create', 'edit']}, function (user) {
        user.get('activate', 'users#activate');
        user.put('change_password', 'users#changePassword', userRequired);
        user.post('change_email', 'users#changeEmail', userRequired);
    });

    map.resources('session', {only: ['new', 'create']}, function (session) {
        session.get('destroy', 'session#destroy');
    });

    map.get('/', 'routes#index', userRequired);
    map.resources('routes', {middleware: userRequired});
};
