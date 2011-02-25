function userRequired (req, res, next) {
    if (!req.user) {
        res.redirect('/sessions/new');
    } else {
        if (req.user.forcePassChange && !req.url.match(/change_password/)) {
            res.redirect('/change_password');
        } else {
            next();
        }
    }
}

function adminRequired (req, res, next) {
    if (!req.user || !(req.user.admin || req.user.isSuperAdmin())) {
        res.redirect('/sessions/new');
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
    map.get('change_password', 'users#changePasswordRequired', userRequired);

    map.get('/', 'routes#index', userRequired);
    map.get('/routes/claim', 'routes#claim');
    map.get('/routes/disclaim', 'routes#disclaim');

    map.resources('routes', {middleware: userRequired, middlewareExcept: ['show']});

    map.namespace('admin', function (admin) {
        admin.resources('routes', {middleware: adminRequired}, function (route) {
        });
    })

    map.get('/reset_password', 'users#resetPasswordRequest');
    map.post('/reset_password', 'users#resetPassword');
    map.get('/reset_password_confirm', 'users#resetPasswordConfirm');
};
