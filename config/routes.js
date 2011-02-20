function userRequired (req, res, next) {
    if (!req.user) {
        res.redirect('/session/new');
    } else {
        next();
    }
}

exports.routes = function (map) {
    map.resources('users', {only: ['new', 'create']}, function (user) {
        user.get('activate', 'users#activate');
        user.put('change_password', 'users#changePassword');
    });

    map.resources('session', {only: ['new', 'create']}, function (session) {
        session.get('destroy', 'session#destroy');
    });

    map.get('/', 'routes#index', userRequired);
    map.resources('routes', {middleware: userRequired});
};
