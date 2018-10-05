const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Users = require('./user');

module.exports = () => {
  passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
    done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
  });

  passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
    done(null, user); // 여기의 user가 req.user가 됨
  });

  passport.use(new LocalStrategy({ // local 전략을 세움
    usernameField: 'id',
    passwordField: 'pw',
    session: true, // 세션에 저장 여부
    passReqToCallback: false,
  }, (id, password, done) => {
    Users.findOne({ id: id }, (findError, user) => {
      if (findError) return done(findError); // 서버 에러 처리
      if (!user) return done(null, false, { message: '존재하지 않는 아이디입니다' }); // 임의 에러 처리
      return user.comparePassword(password, (passError, isMatch) => {
        if (isMatch) {
          return done(null, user); // 검증 성공
        }
        return done(null, false, { message: '비밀번호가 틀렸습니다' }); // 임의 에러 처리
      });
    });
  }));
};

// var express = require("express");
// var session = require('express-session');
// var FileStore = require('session-file-store')(session);
// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;

// var app = express();
// app.use(session({
//     secret: '123',
//     resave: false,
//     saveUninitialized: true
// }));
// app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });
  
// passport.deserializeUser(function(id, done) {
//     console.log('deserializeUser', id)
//     return done(null, [{id:'test', pw:'1234'}]);
// });

// var user = [
//     {
//         id: 'test',
//         pw: '1234'
//     }
// ];
// passport.use(new LocalStrategy(
//     function(username, password, done) {
//         if(username === user.id && password === user.pw) {
//             console.log('LocalStorategy', uer);
//             done(null, user);
//         }
//         else {
//             done(null, false);
//         }
//     }
// ))

// app.post('/login', passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: false
// }));

// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const Users = require('./user');

// module.exports = () => {
//   passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
//     done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
//   });

//   passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
//     done(null, user); // 여기의 user가 req.user가 됨
//   });

//   passport.use(new LocalStrategy({ // local 전략을 세움
//     usernameField: 'id',
//     passwordField: 'pw',
//     session: true, // 세션에 저장 여부
//     passReqToCallback: false,
//   }, (id, password, done) => {
//     Users.findOne({ id: id }, (findError, user) => {
//       if (findError) return done(findError); // 서버 에러 처리
//       if (!user) return done(null, false, { message: '존재하지 않는 아이디입니다' }); // 임의 에러 처리
//       return user.comparePassword(password, (passError, isMatch) => {
//         if (isMatch) {
//           return done(null, user); // 검증 성공
//         }
//         return done(null, false, { message: '비밀번호가 틀렸습니다' }); // 임의 에러 처리
//       });
//     });
//   }));
// };