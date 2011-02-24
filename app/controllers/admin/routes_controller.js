module.exports = {
    'new': function (req, next) {
        var route = new TemplateRoute;
        next('render', {
            route: route,
            title: 'New template route'
        });
    },
    'create': function (req, next) {
        TemplateRoute.create(req.body, function (id) {
            if (!id) {
                req.flash('info', 'TemplateRoute can not be created');
                next('render', 'new', {route: this, title: ''});
            } else {
                TemplateRoute.reloadTemplates(function () {
                    req.flash('info', 'TemplateRoute created');
                    next('redirect', path_to.admin_routes);
                });
            }
        });
    },
    'index': function (req, next) {
        next('render', {
            routes: app.template_routes,
            title: 'Routes index'
        });
    },
    'edit': function (req, next) {
        TemplateRoute.find(req.params.id, function (err, route) {
            next('render', {
                route: route,
                title: 'Edit template route details'
            });
        });
    },
    'update': function (req, next) {
        TemplateRoute.find(req.params.id, function (err, route) {
            route.save(req.body, function (err) {
                if (!err) {
                    TemplateRoute.reloadTemplates(function () {
                        req.flash('info', 'Route updated');
                        next('redirect', path_to.admin_routes);
                    });
                } else {
                    req.flash('error', 'Route can not be updated');
                    next('render', 'edit', {route: route, title: 'Edit route details'});
                }
            });
        });
    },
    'destroy': function (req, next) {
        TemplateRoute.find(req.params.id, function (err, route) {
            route.destroy(function (error) {
                if (err || error) {
                    req.flash('error', 'Can not destroy route');
                } else {
                    TemplateRoute.reloadTemplates(function () {
                        req.flash('info', 'Route successfully removed');
                    });
                }
                next('redirect', path_to.admin_routes);
            });
        });
    }
};
