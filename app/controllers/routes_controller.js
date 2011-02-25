module.exports = {
    'new': function (req, next) {
        var route = new Route;
        route.user_id = req.user.id;
        if (req.session.pendingUUID) {
            route.uuid = req.session.pendingUUID;
        } else {
            // route.generateUUID();
        }
        next('render', {
            route: route,
            title: 'New route',
            template_routes: app.template_routes
        });
    },
    'create': function (req, next) {
        if (req.body.uuid == req.session.pendingUUID) {
            delete req.session.pendingUUID;
        }
        req.user.createRoute(req.body, function (errors) {
            if (errors) {
                req.flash('error', 'Route can not be created');
                next('render', 'new', {
                    route: this,
                    title: '',
                    template_routes: app.template_routes
                });
            } else {
                req.flash('info', 'Route created');
                next('redirect', '/routes');
            }
        });
    },
    'index': function (req, next) {
        req.user.getRoutes(function (routes) {
            routes = routes.map(function (r) { r.assignTemplate(); return r;});
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
                    next('redirect', '/routes/claim');
                } else {
                    var queryString = req.url.split('?')[1],
                        redirect = route.redirect(queryString, id);
                    console.log('redirect to', redirect);
                    next('redirect', redirect);
                }
            });
            return;
        }
        if (req.user) {
            req.user.getRoute(req.params.id, function (route) {
                if (route) {
                    next('render', {
                        route: route,
                        title: 'Route details'
                    });
                } else {
                    req.flash('error', 'Route not found');
                    next('redirect', '/');
                }
            });
        } else {
            next('redirect', path_to.new_session);
        }
    },
    'edit': function (req, next) {
        req.user.getRoute(req.params.id, function (err, route) {
            next('render', {
                route: route,
                title: 'Edit route details',
                template_routes: app.template_routes
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
                    next('render', 'edit', {
                        route: route,
                        title: 'Edit route details',
                        template_routes: app.template_routes
                    });
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
                next('send', "'" + path_to.routes + "'");
            });
        });
    },
    'claim': function (req, next) {
        next('render', {
            title: 'Claim route'
        });
    },
    'disclaim': function (req, next) {
        delete req.session.pendingUUID;
        next('redirect', '/');
    }
};
