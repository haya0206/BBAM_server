const express = require('express');
const cors = require('cors');
var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;
var cookieSession = require('cookie-session');
var flash = require('connect-flash');
const app = express();
var router = express.Router();

app.use(cookieSession({
    keys: ['bbam_keys'],
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.json());

passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
    log('serializeUser - ' + user);
    done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
});

passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
    log('DeserializeUser - ' + user);
    done(null, user); // 여기의 user가 req.user가 됨
});

passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
  ));

// passport.use(new LocalStrategy({ // local 전략을 세움
//     usernameField: 'id',
//     passwordField: 'pw',
//     session: true, // 세션에 저장 여부
//     passReqToCallback: false,
// }, (req, username, password, done) => {
//     if(username==='test' && password ==='1234') {
//         return done(null, {
//             'user_id' : username,
//         });
//     } else {
//         return done(false, null);
//     }
// }));

const port = process.env.PORT || 5000;

router.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureFlash: true}), // 인증 실패 시 401 리턴, {} -> 인증 스트레티지
function (req, res) {
    console.log(req.body);
    
    res.redirect('/home');
});

// app.post('/login', (req, res) => {
//     console.log(req.body);
  
//     res.status(200).json('login success');
// });

app.listen(port, () => console.log(`Listening on port ${port}`));