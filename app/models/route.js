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
