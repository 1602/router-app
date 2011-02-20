module.exports = {
    'new': function (req, next) {
        var route = new Route;
        route.user_id = req.user.id;
        route.generateUUID();
        next('render', {
            route: route,
            title: 'New route'
        });
    },
    'create': function (req, next) {
        req.user.createRoute(req.body, function () {
            next('redirect', '/routes');
        });
    },
    'index': function (req, next) {
        req.user.getRoutes(function (routes) {
            next('render', {
                routes: routes,
                title: 'Routes index'
            });
        });
    },
    'show': function (req, next) {
        req.user.getRoute(req.params.id, function (route) {
            next('render', {
                route: route,
                title: 'Route details'
            });
        });
    },
    'edit': function (req, next) {
        req.user.getRoute(req.params.id, function (route) {
            next('render', {
                route: route,
                title: 'Edit route details'
            });
        });
    }
};
