var Route = describe("Route", function () {
    property("uuid", String);
    property("user_id", Number);
    property("name", String);
    property("target", String);
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
    return uuid.match(Route.checkUUIDRegExp);
};

Route.prototype.redirect = function (queryString) {
    var joiner = this.target.indexOf('?') === -1 ? '?' : '&';
    return this.target + (queryString ? joiner + queryString : '');
};

Route.prototype.validate = function () {
    this.errors = [];

    if (!Route.matchUUID(this.uuid)) {
        this.errors.push(['uuid', 'Incorrect format']);
    }

    if (!this.target) {
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
        this.save(function (err) {
            callback.call(this, err);
        }.bind(this));
    } else {
        callback.call(this, this.errors);
    }
};
