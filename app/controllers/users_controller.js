
action('new', function () {
    render({
        title: 'New user registration',
        recaptchaKey: app.config.recaptcha.publicKey
    });
});

action('create', function () {
    // Check required params
    var email = req.body['user[email]'];
    if (!email || !email.match(/^[^@]*?@[^@]*$/)) {
        flash('error', 'Incorrect email');
        return;
    }

    // Check captcha
    require(__dirname + '/lib/recaptcha.js').verifyCaptcha({
        challenge:  req.body.recaptcha_challenge_field,
        response:   req.body.recaptcha_response_field,
        privatekey: app.config.recaptcha.privateKey,
        remoteip:   '127.0.0.1'
    }, function (success, error) {
        if (!success && app.settings.env !== 'development') {
            flash('error', 'Incorrect security code');
            redirect(path_to.new_user);
            return;
        }

        // Check email uniqueness
        User.find_by_email(email, function (err) {
            if (!err) {
                flash('error', 'Email already taken');
                redirect(path_to.new_user);
                return;
            }

            // Everything ok, register user
            User.register(email, function (err, message) {
                if (err) {
                    flash('error', message);
                    redirect(path_to.new_user);
                } else {
                    flash('info', 'Please check you email to confirm account and finish registration');
                    redirect('/');
                }
            });
        });
    });
});

action('activate', function () {
    User.activate(req.params.user_id, function (err) {
        // authenticate user
        req.session.user_id = this.id;
        if (!err) {
            flash('info', 'Your email has been confirmed');
        }
        render({
            title: 'User activation',
            user: err ? null : this,
            changePasswordRequired: !req.query.nopasschange
        });
    });
});

action('changePassword', function () {
    if (req.user.changePassword(req.body.current_password, req.body.password)) {
        flash('info', 'Password has been changed');
        redirect(req.session.pendingUUID ? path_to.new_route : '/');
    } else {
        flash('error', 'Can not change password');
        render('edit', {
            user: req.user,
            title: 'Edit account details'
        });
    }
});

action('changePasswordRequired', function () {
    render('change_password', {
        title: 'Change password',
        user: req.user
    });
});

action('edit', function () {
    if (req.user) {
        render({
            user: req.user,
            title: 'Edit account details'
        });
    } else {
        flash('Authorization required');
        redirect(path_to.new_session);
    }
});

action('changeEmail', function () {
    if (req.user.email !== req.body.email) {
        req.user.changeEmail(req.body.email);
        send('Confirmation required');
    } else {
        flash('error', 'email the same');
        render('edit', {
            user: req.user,
            title: 'Edit account details'
        });
    }
});

action('resetPasswordRequest', function () {
    render('reset_password', {
        title: 'Reset password request',
        recaptchaKey: app.config.recaptcha.publicKey //'6Lcss8ESAAAAAFpTO65fFTp-4QyMw3v3qGPYFULp'
    });
});

action('resetPassword', function () {
    // Check required params
    var email = req.body['email'];
    if (!email || !email.match(/^[^@]*?@[^@]*$/)) {
        flash('error', 'Incorrect email');
        redirect(path_to.reset_password);
        return;
    }

    // Check captcha
    require(__dirname + '/lib/recaptcha').verifyCaptcha({
        challenge:  req.body.recaptcha_challenge_field,
        response:   req.body.recaptcha_response_field,
        privatekey: app.config.recaptcha.privateKey,
        remoteip:   '127.0.0.1'
    }, function (success, error) {
        if (!success && app.settings.env !== 'development') {
            flash('error', 'Incorrect security code');
            redirect(path_to.reset_password);
            return;
        }
        User.find_by_email(req.body.email, function (err, user) {
            if (err) {
                flash('error', 'User not found');
                redirect(path_to.reset_password);
            } else {
                user.requestPasswordChange();
                flash('info', 'Reset instructions has been sent to your email address');
                redirect(path_to.reset_password);
            }
        });
    });
});

action('resetPasswordConfirm', function () {
    User.resetPassword(req.query.code, function (err, reason) {
        if (err) {
            flash('error', 'Could not reset password: ' + reason);
        } else {
            flash('info', 'Your password has been reset, check your email');
        }
        redirect(path_to.new_session);
    });
});

