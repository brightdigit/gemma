  var uuid = require('node-uuid'),
    libs = require('../libs'),
    emailer = libs.emailer,
    async = require('async'),
    models = require('../models'),
    Registration = models.registration,
    User = models.user;

module.exports = [{
/**
 * @api {post} /registration Register an email address
 * @apiVersion 1.0.0
 * @apiName Register
 * @apiGroup Registration
 *
 * @apiParam {String} emailAddress Registration Email Address.
 *
 * @apiSuccess {String} key Registration Key for creating a user;
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "key": ""
 *     }
 *
 * @apiError UserNotFound The id of the User was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 */
    verb: 'post',
    callback: function(request, callback) {
      /*
      request.body.key
      request.body.secret
      request.body.emailAddress
      request.body.name
      request.body.password
      */
      function findRegistration (cb) {

        Registration.find({ 
          where : ["emailAddress = ? and `key` = ? and secret = ? and registeredAt > DATE_SUB(NOW(), INTERVAL 5 MINUTE)", request.body.emailAddress, new Buffer(request.body.key, 'base64'), new Buffer(request.body.secret, 'base64')],
          order : "registeredAt DESC"}
        ).success(function (registration) {
          console.log('registration');
          cb(undefined, registration);
        });
      }

      function findUser (cb) {
        // returns list of similar username available or undefined for available name or empty for no similar name
        User.find({
          where : { name : request.body.name }
        }).success(function (user) {
          console.log('user');
          cb(undefined, user);
        });
      }

      async.parallel(
        {
          registration : findRegistration, 
          user : findUser
        }, function (err, results) {
        if (results.registration !== undefined && !results.user) {
          var user = User.create({ 
            name : request.body.name, 
            password : request.body.password, 
            emailAddress : request.body.emailAddress
          }).success(function (user) {
            user.setRegistration(results.registration).success(function (user) {
              callback();
            });
          });
        }
        callback('Error');
      });
    }
  }];
