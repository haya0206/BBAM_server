const express = require("express");
const cors = require("cors");
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
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

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
        type: Sequelize.TINYINT(1).UNSIGNED
    },
    USR_JNDT: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)')
    }
});

const PRB = sequelize.define('PRB', {
    PRB_ID: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    PRB_DIFF: {
        type: Sequelize.TINYINT(1).UNSIGNED
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

const USR_PRB = sequelize.define('USR_PRB', {
    UP_UID: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false
    },
    UP_PID: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false
    },
    UP_SSEQ: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false
    },
    UP_CRCT: {
        type: Sequelize.TINYINT(1)
    },
    UP_DTM: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)')
    }
});

const LOG = sequelize.define('LOG', {
    LOG_DTM: {
        type: Sequelize.DATE(3),
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)')
    },
    LOG_UID: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false
    },
    LOG_PID: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false
    },
    LOG_SSEQ: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false
    },
    // 같은 문제에서 몇 번째로 들어오는 로그인가 -> performance 상 문제가 없는가
    LOG_SEQ: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false
    },
    LOG_ETP: {
        type: Sequelize.STRING(10)
    },
    LOG_BID: {
        type: Sequelize.INTEGER.UNSIGNED
    },
    LOG_BUPID: {
        type: Sequelize.INTEGER.UNSIGNED
    },
    LOG_BTP: {
        type: Sequelize.STRING(20)
    },
    LOG_BVL: {
        type: Sequelize.STRING(200)
    }
});

app.post("/asdf", (req, res) => {
    let code = req.body.code.split("\n");

    // 사용할 default 값
    let parsingCodes = [
        // {
        //     UID: "",
        //     PID: 0,
        //     ETP: "",
        //     BID: 0,
        //     BUPID: 0,
        //     BTP: "",
        //     BVL: ""
        // }
    ];
    // 현재 테스트하는 값
    // let parsingCode = [
    //     {
    //         UID: "PSB",
    //         PID: 1,
    //         ETP: "",
    //         BID: 0,
    //         BUPID: 0,
    //         BTP: "",
    //         BVL: ""
    //     }
    // ];
    let parentId = [0];
    let preDepth = 0;
    const codeLength = code.length;
    for (let i = 0; i < codeLength - 1; i++) {
        let parsing = {};
        parsing.UID = req.body.UID;
        parsing.PID = req.body.PID;
        parsing.ETP = req.body.ETP;
        // id 설정
        parsing.BID = i + 1;
        // depth 계산
        let depth = 0;
        const codeLineLength = code[i].length;
        for (let j = 0; j < codeLineLength; j++) {
            if (code[i][j] === " " && code[i][j + 1] === " ") {
                depth++;
                j++;
            }
        }
        if (depth > preDepth) {
            parentId.push(i);
        } else if (depth < preDepth) {
            parentId.pop();
        }
        preDepth = depth;
        parsing.BUPID = parentId[parentId.length - 1];
        // type 찾기
        while (code[i][0] === " ") {
            code[i] = code[i].slice(2);
        }
        const codeSplit = code[i].split(" ");
        if (codeSplit[0] === "if") {
            parsing.BTP = "IF";
            parsing.BVL = code[i].slice(3, -1);
        } else if (codeSplit[0] === "while") {
            parsing.BTP = "WHILE";
            parsing.BVL = code[i].slice(6, -1);
        } else if (codeSplit[0] === "for") {
            parsing.BTP = "FOR";
            parsing.BVL = code[i].slice(4, -1);
        } else if (code[i].slice(0, 5) === "print") {
            parsing.BTP = "PRINT";
            parsing.BVL = code[i].slice(6, -1);
        } else if (codeSplit[1] === "=") {
            parsing.BTP = "DEFINE";
            parsing.BVL = codeSplit[2];
        } else if (codeSplit[0] === "pass") {
            parsing.BTP = "PASS";
            parsing.BVL = "";
        }
        parsingCodes.push(parsing);
    }
    //console.log(parsingCodes);

    // LOG_SSEQ와 LOG_SEQ는 별도의 공정이 필요, Mysql의 SELECT 역할을 하는 Sequelize 기능 필요, 현재는 임의의 값
    // LOG_SSEQ를 알아낸 다음에 LOG를 INSERT해야 함
    // LOG.findAll()...

    // SEQ도 올라가도록 넣어야 함, 또는 AUTO_INCREASE를 한 뒤, 다음 로그 때 1부터 시작하도록 설정해보기
    // 현재 0.001초가 겹치기에 SEQ를 증가시키지 않으면 Primary Key가 겹침
    // parsingCodes.forEach((parsingCode, index) => {
    //     LOG.create({LOG_UID: parsingCode.UID, LOG_PID: parsingCode.PID, LOG_SSEQ: 1, LOG_SEQ: 1,
    //         LOG_ETP: parsingCode.ETP, LOG_BID: parsingCode.BID, LOG_BUPID: parsingCode.BUPID, LOG_BTP: parsingCode.BTP, LOG_BVL: parsingCode.BVL})
    //     .then(result => {
    //         // console.log(result);
    //         if(index === parsingCodes.length - 1) {
    //             res.status(200).json("Log Insert Success");
    //         }
    //     })
    //     .catch(err => {
    //         console.error(err);
    //     })
    // })
    // test 코드
    parsingCodes.forEach((parsingCode, index) => {
        LOG.create({LOG_UID: parsingCode.UID, LOG_PID: parsingCode.PID, LOG_SSEQ: 1, LOG_SEQ: Math.random() * 10000,
            LOG_ETP: parsingCode.ETP, LOG_BID: parsingCode.BID, LOG_BUPID: parsingCode.BUPID, LOG_BTP: parsingCode.BTP, LOG_BVL: parsingCode.BVL})
        .then(result => {
            // console.log(result);
            if(index === parsingCodes.length - 1) {
                res.status(200).json("Log Insert Success");
            }
        })
        .catch(err => {
            console.error(err);
        })
    })
});

app.post('/problemList', (req, res) => {
    var diff = req.body.diff;
    var cls = req.body.cls;

    PRB.findAll({
        attributes: ['PRB_CNT', 'PRB_HNT'],
        where: {
            PRB_diff: diff,
            PRB_CLS: cls
        }
    })
    .then(results =>
        results && results.length && results.length > 0
        ? results
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
});

app.listen(port, () => console.log(`Listening on port ${port}`));