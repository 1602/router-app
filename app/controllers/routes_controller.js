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
        req.user.createRoute(req.body, function (errors) {
            if (errors) {
                req.flash('info', 'Route can not be created');
                next('render', 'new', {route: this});
            } else {
                req.flash('info', 'Route created');
                next('redirect', '/routes');
            }
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
                        redirect = route.redirect(queryString, id);
                    console.log('redirect to', redirect);
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
        req.user.getRoute(req.params.id, function (err, route) {
            next('render', {
                route: route,
                title: 'Edit route details'
            });
        });
    },
    'update': function (req, next) {
        req.user.getRoute(req.params.id, function (err, route) {
            route.update(req.body, function (err) {
                if (!err) {
                    req.flash('info', 'Route updated');
                    next('redirect', path_to.routes);
                } else {
                    req.flash('error', 'Route can not be updated');
                    next('render', 'edit', {route: route, title: 'Edit route details'});
                }
            });
        });
    },
    'destroy': function (req, next) {
        req.user.getRoute(req.params.id, function (err, route) {
            route.removeWithIndex(function (error) {
                if (err || error) {
                    req.flash('error', 'Can not destroy route');
                } else {
                    req.flash('info', 'Route successfully removed');
                }
                next('redirect', path_to.routes);
            });
        });
    }
};
