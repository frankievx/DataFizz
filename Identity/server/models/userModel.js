var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Promise = require('bluebird');
var Util = require('./helpers/util.js');
var User = require('../schemas/User.js');


/************************ Helpers *******************************/


function checkDuplicateEmail(email) { 
  return new Promise(function(resolve, reject){
    return User.find({ email: email }, function(err, user) {
      if (err) throw (err);
      if (user.length > 0 ) resolve(true);
      else resolve(false);
    });
  });
}


/************************ API *******************************/


function createUser(req, res) {
  var user = new User({ 
    email: req.body.email, 
    password: req.body.password
  });

  // Check for identical emails to prevent duplicates.
  checkDuplicateEmail(req.body.email)

  // If found then handle the response
  .then(function(found){
    if(found) return res.json({ success: false, message: "This email is associated with another user"});

    // Else hash the password
    else {
      Util.hashPassword(req.body.password)

      // Set user password to the hashedPassword and then save the user to the database
      .then(function(hashedPassword) {
        user.password = hashedPassword;
        user.save(function(err) {
          if (err) throw err;
          return res.json({ success: true, message: "You have successfuly signed up! Now you can go ahead and sign in." });
        });
      })
    }
  })
  .catch(function(err) {
    console.log(err);
    return res.json({ success: false, message: "An error has occurred in the process of signing up." });
  })
};


function changeEmail(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var newEmail = req.body.newEmail;
  var confirmEmail = req.body.confirmEmail;

  // Handles input check for email.
  if( newEmail != confirmEmail ) {
    res.json({ success: false, message: 'Your new email and confirmed email do not match.' });
  }

  //Handles check for any duplicate emails compared to the newEmail input in the system 
  else {
    checkDuplicateEmail(newEmail)
    .then(function(found) { 

      // Sends appropriate response if the new email is found
      if(found) {
        res.json({ success: false, message: 'This email is already associated with another user.'});
      }

      // Finds the user with the current email
      else {
        User.findOne({ email: email }, function(err, user) {

          // Handles email lookup error
          if(err) {
            res.json({ success: false, message: 'There are no users associated with the email submitted.'});
          }

          // Compare the current password sent with the password stored in the database
          else {
            Util.comparePassword(password, user.password)
            .then(function(bool) {

              //If successful, it will take the modified user object and save the new email
              if(bool) {
                user.email = newEmail;
                user.save(function(err) {

                  //Throws an error if an error occurs during the save
                  if (err) {
                    throw err;
                  }

                  //Handles password save success
                  else {
                    res.json({ success: true, email: newEmail, message: 'You have successfully changed your email!' });
                  }
                })
              }

              //Handles password input error
              else {
                res.json({ success: false, message: 'You have submitted the incorrect password for this user.' });
              }
            })
            .catch(function(err) {
              console.log(err);
              res.json({ success: false, message: 'There has been an error during the process of changing your email.' });
            });
          }
        });
      }
    });
  }
}


function changePassword(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var newPassword = req.body.newPassword;
  var confirmPassword = req.body.confirmPassword;

  //Database Lookup using email sent in request
  //If error will send a response to client notifying the failure
  User.findOne({ email: email }, function(err, user) {
    //Handles email lookup error.
  	if(err) res.json({ success: false, message: 'There are no users associated with the email submitted.'});

    //Handles checking password inputs sent from the client
  	else if( newPassword != confirmPassword ) {
  		res.json({ success: false, message: 'Your new password and confirmed password do not match.' });
  	}

    //Compare the current password sent with the password stored in the database
    else {
      Util.comparePassword(password, user.password)
      .then(function(bool) { 

        //If successful, it will take the modified user object and hash the  new password then proceed to save to the db
        if(bool) {
          Util.hashPassword(newPassword)
          .then(function(hash) {
            user.password = hash;
        		user.save(function(err) {

              //Error handler for any error in the process of saving the new password. Throws error for general function errors.
        			if (err) {
                throw err;
        			}

              //Handles success on password change
        			else {
        				res.json({ success: true, message: 'You have successfully changed your password!' });
        			}
        		})
          })
        }

        // Handles incorrect password submission
        else {
          res.json({ success: false, message: 'You have submitted the incorrect password for this user.' });
        }
      })
      .catch(function(err) {
        res.json({ success: false, message: 'There has been an error during the process of changing your password.' });
      })
    }
  })
}


module.exports = {
  createUser: createUser,
  changeEmail: changeEmail,
  changePassword: changePassword
}