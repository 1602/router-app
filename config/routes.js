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

    map.resources('sessions', {only: ['new', 'create', 'destroy']});

    map.get('/', 'routes#index', userRequired);
    map.resources('routes', {middleware: userRequired, middlewareExcept: ['show']});
};
