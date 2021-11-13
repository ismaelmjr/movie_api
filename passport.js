
const passport = require('passport'), 
LocalStrategy = require('passport-local').Strategy, //Module for username and password authentication.
Models = require('./models.js'),
passportJWT = require('passport-jwt'); //Module authenticates endpoits using JSON web token.

let Users = Models.User,
JWTStrategy = passportJWT.Strategy,
ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({ //Create local strategy that authenticates username and password.
usernameField: 'Username',
passwordField: 'Password'
}, (username, password, callback) => {
console.log(username + '  ' + password);
Users.findOne({ Username: username }, (error, user) => {
  if (error) {
    console.log(error);
    return callback(error);
  }

  if (!user) {
    console.log('incorrect username');
    return callback(null, false, {message: 'Incorrect username or password.'});
  }
  
  if (!user.validatePassword(password)) {
    console.log('incorrect password');
    return callback(null, false, {message: 'Incorrect password.'});
  }

  console.log('finished');
  return callback(null, user);
});
}));

passport.use(new JWTStrategy({ // Create JWTStrategy to authenticate user using JSON tokens.
jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
secretOrKey: 'your_jwt_secret'
}, (jwtPayload, callback) => {
return Users.findById(jwtPayload._id)
  .then((user) => {
    return callback(null, user);
  })
  .catch((error) => {
    return callback(error)
  });
}));