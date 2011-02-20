module.exports = {
    'new': function (req, next) {
        next('render', {
            title: 'New user registration',
            recaptchaKey: '6Lcss8ESAAAAAFpTO65fFTp-4QyMw3v3qGPYFULp'
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
            privatekey: '6Lcss8ESAAAAAFjSqRPRhz0wCLpsdhUev5qN7UG5',
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
                user: err ? null : this
            });
        });
    },
    'changePassword': function (req, next) {
        if (req.user) {
            req.user.changePassword(req.body.password);
            next('send', 'password changed');
        } else {
            next('send', 'password not changed');
        }
    }
};

