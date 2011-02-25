var User = describe("User", function () {
    property("email",          String);
    property("password",       String);
    property("activationCode", String);
    property("activated",      Boolean);
    property("forcePassChange",Boolean);
    property("routesCount",    Number);
    property("isAdmin",        Boolean);
});

User.LIMIT_ROUTES_COUNT = 10;

function getRandomHash () {
    return require('crypto').createHash('md5').update(require('node-uuid')()).digest('hex');
}

User.createActivationCode = function () {
    return getRandomHash();
};

User.prototype.prepareActivation = function (activationCode) {
    if (activationCode) {
        this.updateAttribute('activationCode', activationCode);
        this.updateAttribute('activated', false);
    }
    this.connection.set('activation:' + this.activationCode, this.id);
};

User.activate = function (code, callback) {
    User.connection.get('activation:' + code, function (err, data) {
        if (!err && data) {
            var user_id = data.toString();
            User.find(user_id, function () {
                User.connection.del('activation:' + code);
                this.updateAttribute('activated', true, function () {
                    callback.call(this, err);
                }.bind(this));
                // Email index
                User.connection.set('user_by_email:' + this.email.toLowerCase(), this.id);
            });
        } else {
            callback(true);
        }
    });
};

User.generatePassword = function (len) {
    len = len || 8;
    return getRandomHash().slice(0, len);
};

User.encryptPassword = function (password) {
    return require('crypto').createHash('md5').update(password).digest('hex');
};

User.find_by_email = function (email, callback) {
    User.connection.get('user_by_email:' + email.toLowerCase(), function (err, data) {
        if (!err && data) {
            User.find(data.toString(), callback);
        } else {
            callback.call(null, true);
        }
    });
};

User.register = function (email, callback) {
    User.create({
        email: email,
        activationCode: User.createActivationCode(),
        activated: false,
        password: '',
        forcePassChange: true
    }, function (id) {
        this.prepareActivation();
        require('mailer').send({
            host: "localhost",              // smtp server hostname
            port: "25",                     // smtp server port
            ssl: true,                      // for SSL support - REQUIRES NODE v0.3.x OR HIGHER
            domain: "webdesk.homelinux.org",            // domain used by client to identify itself to server
            to: this.email,
            from: "noreply@webdesk.homelinux.org",
            subject: "Activate your account",
            body: "Hi!\n To activate you account follow the link: http://router.node-js.ru/users/" + this.activationCode + "/activate",
            authentication: "no auth"
        }, function () {
            // console.log(arguments);
        });
        callback.call(this);
    });
};

User.prototype.changePassword = function (old_password, password) {
    if (User.encryptPassword(old_password) == this.password || this.password == '') {
        this.updateAttribute('password', User.encryptPassword(password));
        if (this.forcePassChange) {
            this.updateAttribute('forcePassChange', false);
        }
        return true;
    } else {
        return false;
    }
};

User.authenticate = function (email, password, callback) {
    User.find_by_email(email, function (err, user) {
        if (!err) {
            if (user.matchPassword(password)) {
                if (user.activated) {
                    success(user);
                } else {
                    fail('email not confirmed');
                }
            } else {
                fail('wrong password');
            }
        } else {
            fail('user not found');
        }
    });

    function fail(message) {
        callback(false, message);
    }

    function success(user) {
        callback(true, user);
    }
};

User.prototype.matchPassword = function (password) {
    return this.password === User.encryptPassword(password);
};

User.prototype.createRoute = function (params, callback) {
    var user = this, requireCallbacks = 3;

    params.user_id = user.id;

    var route = new Route(params);

    if (this.freeRouteSlots() <= 0) {
        route.errors = [['user', 'Routes limit reached']];
        callback.call(route, route.errors);
        return;
    }

    if (!route.validate()) {
        callback.call(route, route.errors);
        return;
    }

    route.save(function () {
        user.connection.set('route_by_user:' + user.id + ':' + this.id, this.id, next);
        user.connection.set('route_by_uuid:' + this.uuid, this.id, next);
        user.incrementRoutes(next);
    });

    function next () {
        if (--requireCallbacks === 0) {
            callback.call(route, null);
        }
    }
};

User.prototype.getRoute = function (id, callback) {
    this.connection.get('route_by_user:' + this.id + ':' + id, function (err, data) {
        if (!err && data && data.toString() == id) {
            Route.find(id, callback);
        } else {
            callback(err, null);
        }
    });
};

User.prototype.getRoutes = function (callback) {
    this.connection.keys('route_by_user:' + this.id + ':*', function (err, ids) {
        ids = ids || [];
        var result = [], routesCount = ids.length;

        if (routesCount === 0) {
            done();
        }

        ids.forEach(function (key) {
            var id = parseInt(key.toString().split(':')[2], 10);
            Route.find(id, collect);
        });

        function collect (err, route) {
            result.push(route);
            if (--routesCount === 0) {
                done();
            }
        }

        function done () {
            callback(result);
        }
    });
};

User.prototype.incrementRoutes = function (callback) {
    if (this.routesCount) {
        this.updateAttribute('routesCount', this.routesCount + 1, callback);
    } else {
        this.updateAttribute('routesCount', 1, callback);
    }
};

User.prototype.decrementRoutes = function (callback) {
    if (this.routesCount) {
        this.updateAttribute('routesCount', this.routesCount - 1, callback);
    } else {
        this.updateAttribute('routesCount', 0, callback);
    }
};

User.prototype.changeEmail = function (email, callback) {
    var user = this;
    // remove old index
    User.connection.del('user_by_email:' + user.email);
    // add new index
    User.connection.set('user_by_email:' + email, user.id);
    // update property
    this.updateAttribute('email', email, function () {
        var activationCode = User.createActivationCode();
        // re-activation required
        user.prepareActivation(activationCode);
        sendEmail(this.email, "Activate your account", "Hi!\n To confirm email after email\
        changing please follow link:\
        http://router.node-js.ru/users/" + activationCode + "/activate?nopasschange=true");
    });
};

User.prototype.isSuperAdmin = function () {
    return this.email == 'rpm1602@gmail.com';
};

User.prototype.canCreateRoute = function () {
    return this.freeRouteSlots() > 0;
};

User.prototype.freeRouteSlots = function () {
    return User.LIMIT_ROUTES_COUNT - (this.routesCount || 0);
};

User.prototype.requestPasswordChange = function () {
    var activationCode = User.createActivationCode();
    User.connection.set('reset_password:' + activationCode, this.id);
    sendEmail(this.email, "Reset password instruction",
    "Hi!\n If you want to change your password please follow the link:\
    http://router.node-js.ru/reset_password_confirm?code=" + activationCode
    );
};

User.resetPassword = function (activationCode, callback) {
    User.connection.get('reset_password:' + activationCode, function (err, data) {
        if (err || !data) {
            callback(true, 'wrong activation code');
            return;
        }
        User.find(data.toString(), function (err, user) {
            console.log(arguments);
            if (err) {
                callback(true, 'user not found');
                return;
            }
            var newPassword = User.generatePassword();
            user.updateAttribute('password', User.encryptPassword(newPassword));
            user.connection.del('reset_password:' + activationCode);
            sendEmail(this.email, 'Your password has been reset', 'New password is: ' + newPassword + '\n');
            callback(false);
        });
    });
};

function sendEmail(email, subj, body) {
    require('mailer').send({
        host:          "localhost",              // smtp server hostname
        port:          "25",                     // smtp server port
        domain:        "node-js.ru",             // domain used by client to identify itself to server
        from:          "noreply@node-js.ru",
        ssl:           true,
        to:            email,
        subject:       subj,
        body:          body,
        authentication: "no auth"        // auth login is supported; anything else is no auth
    }, function (err) {
        if (!err) {
            console.log('=== Email sent');
            console.log(email);
            console.log(subj);
            console.log(body);
        }
    });
}
