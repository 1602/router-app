module.exports = {
    'new': function (req, next) {
        var route = new Route;
        route.user_id = req.user.id;
        if (req.session.pendingUUID) {
            route.uuid = req.session.pendingUUID;
        } else {
            route.generateUUID();
        }
        next('render', {
            route: route,
            title: 'New route'
        });
    },
    'create': function (req, next) {
        if (req.body.uuid == req.session.pendingUUID) {
            delete req.session.pendingUUID;
        }
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
        var id = req.params.id;
        if (Route.matchUUID(id)) {
            Route.findByUUID(id, function (notFound, route) {
                if (notFound) {
                    req.session.pendingUUID = id;
                    if (req.user) {
                        next('redirect', '/routes/new');
                    } else {
                        next('redirect', '/users/new');
                    }
                } else {
                    var queryString = req.url.split('?')[1],
                        redirect = route.redirect(queryString);
                    next('redirect', redirect);
                }
            });
            return;
        }
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
