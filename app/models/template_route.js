var TemplateRoute = describe("TemplateRoute", function () {
    property("name", String);
    property("target", String);

});

TemplateRoute.reloadTemplates = function (cb) {
    TemplateRoute.allInstances(function (trs) {
        console.log('reloading template routes', trs && trs.length);
        app.template_routes = trs;
        if (cb) {
            cb(trs);
        }
    });
};
