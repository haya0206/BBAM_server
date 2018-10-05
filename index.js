const express = require('express');
const cors = require('cors');
// const session = require('express-session');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
    'BBAM',
    'root',
    'bbam',
    {
        'host': '13.125.181.57',
        'dialect': 'mysql',
        define: {
            freezeTableName: true,
            timestamps: false
        }
    }
);
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch(err => {
    console.error('Unable to connect to database:', err);
});
// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;

const app = express();
app.use(cors());
app.use(express.json());
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

const port = process.env.PORT || 5000;

// 테스트 코드
const USR = sequelize.define('USR', {
    USR_ID: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false
    },
    USR_PW: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    USR_NM: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    USR_ADDR_ST: {
        type: Sequelize.STRING(10)
    },
    USR_ADDR_CT: {
        type: Sequelize.STRING(20)
    },
    USR_ADDR_STRT: {
        type: Sequelize.STRING(20)
    },
    USR_SCHL: {
        type: Sequelize.STRING(20)
    },
    USR_GRD: {
        type: Sequelize.TINYINT
    },
    USR_JNDT: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
});

const PRB = sequelize.define('PRB', {
    PRB_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    PRB_DIFF: {
        type: Sequelize.TINYINT(1)
    },
    PRB_CLS: {
        type: Sequelize.STRING(10)
    },
    PRB_CNT: {
        type: Sequelize.STRING(500)
    },
    PRB_HNT: {
        type: Sequelize.STRING(500)
    },
    PRB_IN: {
        type: Sequelize.STRING(100)
    },
    PRB_OUT: {
        type: Sequelize.STRING(100)
    },
    PRB_RTN: {
        type: Sequelize.INTEGER
    }
});

// const GM = sequelize.define('GM', {
//     GM_ID: {
//         type: Sequelize.STRING(10),
//         primaryKey: true,
//         allowNull: false
//     },
//     GM_LV: {
//         type: Sequelize.TINYINT,
//         defaultValue: 1
//     },
//     GM_EXP: {
//         type: Sequelize.INTEGER,
//         defaultValue: 0
//     },
//     GM_RTN: {
//         type: Sequelize.INTEGER
//     }
// });

app.post('/login', (req, res) => {
    // console.log(req.body);

    USR.findAll()
    .then(results => {
        console.log(results);
    })
    .catch(err => {
        console.log(err);
    });

    res.status(200).json("success");
});

app.post('/problem', (req, res) => {
    var diff = req.body.diff;
    var cls = req.body.cls;

    PRB.findAll({
        attributes: ['PRB_CNT', 'PRB_HNT'],
        where: {
            PRB_DIFF: diff,
            PRB_CLS: cls
        }
    })
    .then(results => 
        results && results.length && results.length > 0
        ? results[0]
        : {
            PRB_CNT: "문제가 없습니다.",
            PRB_HNT: "문제가 없습니다."
        }
    )
    .then(dataValues => {
        console.log(dataValues);
        res.status(200).json(dataValues);
    })
    .catch(err => {
        console.log(err);
    })
    
    // console.log(result);
    // res.status(200).json(result);
});

app.post('./gm', (req, res) => {
    GM.findAll()
    .then(results => {
        console.log(results);
    })
    .catch(err => {
        console.log(err);
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));



// const GM_INFO = sequelize.define('GM_INFO', {
//     GM_ID: {
//         type: Sequelize.STRING(10),
//         primaryKey: true,
//         allowNull: false
//     },
//     GM_LV: {
//         type: Sequelize.TINYINT,
//         defaultValue: 1
//     },
//     GM_EXP: {
//         type: Sequelize.INTEGER,
//         defaultValue: 0
//     },
//     GM_RTN: {
//         type: Sequelize.INTEGER
//     }
// }, {
//     timestamps: false
// });

// GM_INFO.sync({force: false}).then(() => {
//     return GM_INFO.create({
//         GM_ID: 'TEST',
//         GM_RTN: 1000
//     });
// });

// GM_INFO.create({
//     GM_ID: 'TEST',
//     GM_RTN: 1000
// });

// GM_INFO.findAll().then(users => {
//     console.log(users);
// })

// const express = require("express");
// var router = express.Router();

// var mysql = require('mysql');

// var connection = mysql.createConnection({
//   user      : "root",
//   password  : "cosmos0",
//   database  : "test",
//   port      : 5000
// });

// router.get('/', function(req, res, next) {
//   connectionquery("SELECT * from test;"), function(err, result, fields) {
//     if(err) {
//       console.log("쿼리문에 오류가 있습니다.");
//     }
//     else {
//       console.log(result);
//       //res.json(result);
//     }
//   }
// });
// module.exprots = router;

// var mysql      = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'cosmos0',
//   port     : 3306,
//   database : 'BBAM'
// });

// connection.connect();

// // 사용자 신상 정보 보기
// connection.query('SELECT * FROM USR_INFO ORDER BY USR_JNDT ASC', function(err, rows, fields) {
//     if(!err) {
//         console.log("<<사용자 신상 정보>>");
//         console.log(rows);
//     }
//     else {
//         console.log('Error while performing Query. - 사용자 신상 정보', err);
//     }
// });

// // 사용자 게임 정보 보기
// connection.query('SELECT * FROM GM_INFO', function(err, rows, fileds) {
//     if(!err) {
//         console.log("<<사용자 게임 정보>>");
//         console.log(rows);
//     }
//     else {
//         console.log('Error while performing Query. - 사용자 게임 정보', err);
//     }
// });

// 문제 정보 보기
// connection.query('SELECT * FROM PRB_INFO', function(err, rows, fields) {
//     if(!err) {
//         console.log("<<문제 정보>>");
//         console.log(rows);
//     }
//     else {
//         console.log('Error while performing Query. - 문제 정보', err);
//     }
// });

// connection.end();