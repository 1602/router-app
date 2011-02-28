action('new', function () {
    var route = new TemplateRoute;
    render({
        route: route,
        title: 'New template route'
    });
});

action('create', function () {
    TemplateRoute.create(req.body, function (id) {
        if (!id) {
            flash('info', 'TemplateRoute can not be created');
            render('new', {route: this, title: ''});
        } else {
            TemplateRoute.reloadTemplates(function () {
                flash('info', 'TemplateRoute created');
                redirect(path_to.admin_routes);
            });
        }
    });
});

action('index', function () {
    render({
        routes: app.template_routes,
        title: 'Routes index'
    });
});

action('edit', function () {
    TemplateRoute.find(req.params.id, function (err, route) {
        render({
            route: route,
            title: 'Edit template route details'
        });
    });
});

action('update', function () {
    TemplateRoute.find(req.params.id, function (err, route) {
        route.save(req.body, function (err) {
            if (!err) {
                TemplateRoute.reloadTemplates(function () {
                    flash('info', 'Route updated');
                    redirect(path_to.admin_routes);
                });
            } else {
                flash('error', 'Route can not be updated');
                render('edit', {route: route, title: 'Edit route details'});
            }
        });
    });
});

action('destroy', function () {
    TemplateRoute.find(req.params.id, function (err, route) {
        route.destroy(function (error) {
            if (err || error) {
                flash('error', 'Can not destroy route');
            } else {
                TemplateRoute.reloadTemplates(function () {
                    flash('info', 'Route successfully removed');
                });
            }
            redirect(path_to.admin_routes);
        });
    });
});
