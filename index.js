const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'BBAM',
    'root',
    'cosmos0',
    {
        'host': 'localhost', // host를 AWS 서버로 변경해야함
        'dialect': 'mysql',
        define: {
            freezeTableName: true
        }
    }
);

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch(err => {
    console.error('Unable to connect to database:', err);
});

const GM_INFO = sequelize.define('GM_INFO', {
    GM_ID: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false
    },
    GM_LV: {
        type: Sequelize.TINYINT,
        defaultValue: 1
    },
    GM_EXP: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    GM_RTN: {
        type: Sequelize.INTEGER
    }
}, {
    timestamps: false
});

GM_INFO.sync({force: false}).then(() => {
    return GM_INFO.create({
        GM_ID: 'TEST',
        GM_RTN: 1000
    });
});

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