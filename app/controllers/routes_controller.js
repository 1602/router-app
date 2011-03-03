before(userRequired, {except: 'show'});

function userRequired () {
    if (!req.user) {
        flash('error', 'You must be logged in to view this page');
        redirect('/sessions/new');
    } else {
        if (req.user.forcePassChange && !req.url.match(/change_password/)) {
            flash('error', 'Please change you password before you continue');
            redirect('/change_password');
        } else {
            next();
        }
    }
}

action('new', function () {
    var route = new Route;
    route.user_id = req.user.id;
    if (req.session.pendingUUID) {
        route.uuid = req.session.pendingUUID;
    } else {
        // route.generateUUID();
    }
    render({
        route: route,
        title: 'New route',
        template_routes: app.template_routes
    });
});

action('create', function () {
    if (req.body.uuid == req.session.pendingUUID) {
        delete req.session.pendingUUID;
    }
    req.user.createRoute(req.body, function (errors) {
        if (errors) {
            flash('error', 'Route can not be created');
            render('new', {
                route: this,
                title: '',
                template_routes: app.template_routes
            });
        } else {
            flash('info', 'Route created');
            redirect('/routes');
        }
    });
});

action('index', function () {
    req.user.getRoutes(function (routes) {
        routes = routes.map(function (r) { r.assignTemplate(); return r;});
        render({
            routes: routes,
            title: 'Routes index'
        });
    });
});

action('show', function () {
    var id = req.params.id;
    if (Route.matchUUID(id)) {
        Route.findByUUID(id, function (notFound, route) {
            if (notFound) {
                req.session.pendingUUID = id;
                redirect('/routes/claim');
            } else {
                var queryString = req.url.split('?')[1],
                redirect_url = route.redirect(queryString, id);
                console.log('redirect to', redirect_url);
                redirect(redirect_url);
            }
        });
        return;
    }
    if (req.user) {
        req.user.getRoute(req.params.id, function (route) {
            if (route) {
                render({
                    route: route,
                    title: 'Route details'
                });
            } else {
                flash('error', 'Route not found');
                redirect('/');
            }
        });
    } else {
        redirect(path_to.new_session);
    }
});

action('edit', function () {
    req.user.getRoute(req.params.id, function (err, route) {
        render({
            route: route,
            title: 'Edit route details',
            template_routes: app.template_routes
        });
    });
});

action('update', function () {
    req.user.getRoute(req.params.id, function (err, route) {
        route.update(req.body, function (err) {
            if (!err) {
                flash('info', 'Route updated');
                redirect(path_to.routes);
            } else {
                flash('error', 'Route can not be updated');
                render('edit', {
                    route: route,
                    title: 'Edit route details',
                    template_routes: app.template_routes
                });
            }
        });
    });
});

action('destroy', function () {
    req.user.getRoute(req.params.id, function (err, route) {
        route.removeWithIndex(function (error) {
            if (err || error) {
                flash('error', 'Can not destroy route');
            } else {
                flash('info', 'Route successfully removed');
            }
            send("'" + path_to.routes + "'");
        });
    });
});

action('claim', function () {
    render({
        title: 'Claim route'
    });
});

action('disclaim', function () {
    delete req.session.pendingUUID;
    redirect('/');
});
