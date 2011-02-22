module.exports = {
    'new': function (req, next) {
        next('render', {
            title: 'New user registration',
            recaptchaKey: config.recaptcha.publicKey //'6Lcss8ESAAAAAFpTO65fFTp-4QyMw3v3qGPYFULp'
        });
    },
    'create': function (req, next) {
        // Check required params
        var email = req.body['user[email]'];
        if (!email || !email.match(/^[^@]*?@[^@]*$/)) {
            next('send', 'incorrect email');
            return;
        }

        // Check captcha
        require('../../lib/recaptcha.js').verifyCaptcha({
            challenge:  req.body.recaptcha_challenge_field,
            response:   req.body.recaptcha_response_field,
            privatekey: config.recaptcha.privateKey, //'6Lcss8ESAAAAAFjSqRPRhz0wCLpsdhUev5qN7UG5',
            remoteip:   '127.0.0.1'
        }, function (success, error) {
            if (!success) {
                // next('send', 'incorrect security code');
                // return;
            }

            // Check email uniqueness
            User.find_by_email(email, function (err) {
                if (!err) {
                    next('send', 'Email already taken');
                    return;
                }

                // Everything ok, register user
                User.register(email, function (err, message) {
                    next('send', 'check email');
                });
            });
        });
    },
    'activate': function (req, next) {
        User.activate(req.params.user_id, function (err) {
            // authenticate user
            req.session.user_id = this.id;
            next('render', {
                title: 'User activation',
                user: err ? null : this,
                changePasswordRequired: !req.query.nopasschange
            });
        });
    },
    'changePassword': function (req, next) {
        if (req.user.changePassword(req.body.current_password, req.body.password)) {
            next('send', 'password changed');
        } else {
            next('send', 'password not changed');
        }
    },
    'edit': function (req, next) {
        if (req.user) {
            next('render', {
                user: req.user,
                title: 'Edit account details'
            });
        } else {
            req.flash('Authorization required');
            next('redirect', path_to.new_session);
        }
    },
    'changeEmail': function (req, next) {
        if (req.user.email !== req.body.email) {
            req.user.changeEmail(req.body.email);
            next('send', 'confirmation required');
        } else {
            next('send', 'email the same');
        }
    }
};

