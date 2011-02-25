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
                req.flash('error', 'Incorrect security code');
                next('redirect', path_to.new_user);
                return;
            }

            // Check email uniqueness
            User.find_by_email(email, function (err) {
                if (!err) {
                    req.flash('error', 'Email already taken');
                    next('redirect', path_to.new_user);
                    return;
                }

                // Everything ok, register user
                User.register(email, function (err, message) {
                    req.flash('info', 'Please check you email to confirm account and finish registration');
                    next('redirect', '/');
                });
            });
        });
    },
    'activate': function (req, next) {
        User.activate(req.params.user_id, function (err) {
            // authenticate user
            req.session.user_id = this.id;
            this.otp = req.query.otp;
            next('render', {
                title: 'User activation',
                user: err ? null : this,
                changePasswordRequired: !req.query.nopasschange
            });
        });
    },
    'changePassword': function (req, next) {
        if (req.user.changePassword(req.body.current_password, req.body.password)) {
            req.flash('info', 'Password has been changed');
            next('redirect', '/');
        } else {
            req.flash('error', 'Can not change password');
            next('render', 'edit', {
                user: req.user,
                title: 'Edit account details'
            });
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
            next('send', 'Confirmation required');
        } else {
            req.flash('error', 'email the same');
            next('render', 'edit', {
                user: req.user,
                title: 'Edit account details'
            });
        }
    },
    'resetPasswordRequest': function (req, next) {
        next('render', 'reset_password', {
            title: 'Reset password request',
            recaptchaKey: config.recaptcha.publicKey //'6Lcss8ESAAAAAFpTO65fFTp-4QyMw3v3qGPYFULp'
        });
    },
    'resetPassword': function (req, next) {
        // Check required params
        var email = req.body['email'];
        if (!email || !email.match(/^[^@]*?@[^@]*$/)) {
            req.flash('error', 'Incorrect email');
            next('redirect', path_to.reset_password);
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
                req.flash('error', 'Incorrect security code');
                next('redirect', path_to.reset_password);
                return;
            }
            User.find_by_email(req.body.email, function (err, user) {
                if (err) {
                    req.flash('error', 'User not found');
                    next('redirect', path_to.reset_password);
                } else {
                    user.requestPasswordChange();
                    req.flash('info', 'Reset instructions has been sent to your email address');
                    next('redirect', path_to.reset_password);
                }
            });
        });
    },
    'resetPasswordConfirm': function (req, next) {
        console.log(req.query.code);
        User.resetPassword(req.query.code, function (err, reason) {
            if (err) {
                req.flash('error', 'Could not reset password: ' + reason);
            } else {
                req.flash('info', 'Your password has been reset, check your email');
            }
            next('redirect', path_to.new_session);
        });
    }
};

