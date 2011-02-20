// Send a request to recaptcha to verify the user's input.
//
// The first argument must be an object containing four parts:
//    privatekey: Your recaptcha private key.
//    remoteip:   The IP of the user who submitted the form.
//    challenge:  The challenge value from the recaptcha form.
//    response:   The user's response to the captcha.
//
// Example usage (express):
//
//   recaptcha = require 'recaptcha'
//
//   app.post '/comments', (req, res) ->
//       data =
//           privatekey: YOUR_PRIVATE_KEY
//           remoteip:   req.connection.remoteAddress
//           challenge:  req.body.recaptcha_challenge_field
//           response:   req.body.recaptcha_response_field
//
//       recaptcha.verify_captcha data, (success, error_code) ->
//           if success
//               # Passed captcha.
//           else
//               # Did not pass captcha.

var http        = require('http'),
    querystring = require('querystring'),
    API_HOST    = 'www.google.com',
    API_END_POINT = '/recaptcha/api/verify';

exports.verifyCaptcha =  function (data, callback) {
    data = querystring.stringify(data);

    var recaptcha = http.createClient(80, API_HOST);
    var request = recaptcha.request('POST', API_END_POINT, {
        host:             API_HOST,
        'Content-Length': data.length,
        'Content-Type':   'application/x-www-form-urlencoded'
    });

    request.on('response', function (response) {
        var body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            var res        = body.split('\n'),
                success    = res[0],
                errorCode = res[1];
            callback(success == 'true', errorCode);
        });
    });

    request.write(data.toString(), 'utf8');
    request.end();
};
