var Route = describe("Route", function () {
    property("uuid", String);
    property("user_id", Number);
    property("template_route_id", Number);
});

Route.prototype.generateUUID = function () {
    this.uuid = require('node-uuid')();
};

Route.findByUUID = function (uuid, callback) {
    Route.connection.get('route_by_uuid:' + uuid, function (err, data) {
        if (!err && data) {
            Route.find(data.toString(), callback);
        } else {
            callback(true, null);
        }
    });
};

Route.checkUUIDRegExp = /^[A-Z\d]{8}(-[A-Z\d]{4}){3}-[A-Z\d]{12}$/;

Route.matchUUID = function (uuid) {
    if (!uuid) return false;
    return uuid.match(Route.checkUUIDRegExp);
};

Route.prototype.redirect = function (queryString, uuid) {
    queryString = queryString ? queryString + '&' : '';
    queryString += 'uuid=' + uuid;
    return [this.target, queryString].join(this.target.indexOf('?') === -1 ? '?' : '&');
};

Route.prototype.validate = function () {
    this.errors = [];

    if (!Route.matchUUID(this.uuid)) {
        this.errors.push(['uuid', 'Incorrect format']);
    }

    if (!this.template_route_id) {
        this.errors.push(['target', 'Should not be blank']);
    }

    return this.errors.length === 0;
};

Route.prototype.update = function (data, callback) {
    Object.keys(data).forEach(function (key) {
        if (this.hasOwnProperty('_' + key)) {
            this[key] = data[key];
        }
    }.bind(this));

    if (this.validate()) {
        // update index
        if (this.propertyChanged('uuid')) {
            this.connection.del('route_by_uuid:' + this.uuid_was);
            this.connection.set('route_by_uuid:' + this.uuid, this.id);
        }
        // save object
        this.save(function (err) {
            callback.call(this, err);
        }.bind(this));
    } else {
        callback.call(this, this.errors);
    }
};

Route.prototype.removeWithIndex = function (callback) {
    var route = this, error = false, queries = 3;
    this.destroy(function (err) {
        route.connection.del('route_by_uuid:' + route.uuid, next);
        route.connection.del('route_by_user:' + route.user_id + ':' + route.id, next);
        User.find(route.user_id, function () {
            this.decrementRoutes(next);
        });
    });

    function next (err) {
        error = error || err;
        if (--queries == 0) {
            callback(error);
        }
    }
};

Route.prototype.assignTemplate = function () {
    app.template_routes.forEach(function (rt) {
        if (rt.id == this.template_route_id) {
            this.template = rt;
        }
    }.bind(this));
};
