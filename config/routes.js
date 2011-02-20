
exports.routes = function (map) {
    map.resources('users', {only: ['new', 'create']}, function (user) {
        user.get('activate', 'users#activate');
        user.put('change_password', 'users#changePassword');
    });

    map.resources('session', {only: ['new', 'create', 'destroy']});
};
