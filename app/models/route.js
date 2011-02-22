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
