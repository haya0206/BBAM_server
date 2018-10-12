const express = require("express");
const cors = require("cors");
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
    '',
    '',
    '',
    {
        'host': '',
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
    },
    PRB_XML: {
        type: Sequelize.STRING(1000),
        allowNull: false
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
    LOG_SEQ: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false
    },
    LOG_DTM: {
        type: Sequelize.DATE(3),
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)')
    },
    LOG_ETP: {
        type: Sequelize.STRING(10)
    },
    LOG_BID: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false
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

// 난이도, 단원 선택 이후 문제 리스트 보기(return 문제 ID)
// 현재 단원을 받는 대신에 단원을 반환해 주어야 함 -> 미구현된 프론트 부분을 대체하는 식
// 또한 풀었는지 여부를 보내달라고 함                                                       // 구현해야함
app.post('/problemList', (req, res) => {
    var diff = req.body.diff;
    // var cls = req.body.cls;

    PRB.findAll({
        attributes: ['PRB_ID', 'PRB_CLS'],
        where: {
            PRB_DIFF: diff//,
            // PRB_CLS: cls
        }
    })
    .then(results =>
        results && results.length && results.length > 0
        ? results
        : {
            PRB_ID: 0,
            PRB_CLS: null // 임시로 추가
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

// 문제 리스트에서 문제 선택했을 시 문제 정보 전달(return 문제 내용, 문제 힌트, 입력값, 출력값)
// 문제에서 사용하는 XML도 보내기
app.post('/problem', (req, res) => {
    var id = req.body.id;

    PRB.findAll({
        attributes: ['PRB_DIFF', 'PRB_CLS', 'PRB_CNT', 'PRB_HNT', 'PRB_IN', 'PRB_OUT', 'PRB_XML'],
        where: {
            PRB_ID: id
        }
    })
    .then(results =>
        results && results.length && results.length > 0
        ? results
        : {
            PRB_CNT: "문제가 없습니다.",
            PRB_HNT: "문제가 없습니다.",
            PRB_IN: null,
            PRB_OUT: null,
            PRB_XML: null
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

// 문제를 제출하고 채점받은 결과를 저장
app.post('/submit', (req, res) => {
    var uid = req.body.UID;
    var pid = req.body.PID;
    var crct = req.body.crct;

    // SSEQ 가져와야 함
    USR_PRB.max('UP_SSEQ', {
        where: {
            UP_UID: uid,
            UP_PID: pid
        }
    })
    .then(result =>
        result
        ? result
        : 0
    )
    .then(dataValue => {
        USR_PRB.create({
            UP_UID: uid,
            UP_PID: pid,
            UP_SSEQ: dataValue + 1,
            UP_CRCT: crct
        })
        .then(() => {
            res.status(200).json("Submit Success");
        })
        .catch(err => {
            console.error(err);
        })
    })
});

app.post("/log", (req, res) => {
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
        parsing.SEQ = req.body.SEQ;
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
        } else if (codeSplit[0] === "else:") {
            parsing.BTP = "ELSE";
            parsing.BVL = "";
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
    // USR_PRB.findAll({
    //     attributes: [sequelize.fn('max', sequelize.col('UP_SSEQ'))],
    //     where: {
    //         UP_UID: req.body.UID,
    //         UP_PID: req.body.PID,
    //     }
    // })
    // .then(results =>
    //     results && results.length && results.length > 0
    //     ? results
    //     : {
    //         UP_SSEQ: 1
    //     }
    // )
    // .then(dataValues  => {
    //     console.log(dataValues);
    // })
    // .catch(err => {
    //     console.log(err);
    // })
    USR_PRB.max('UP_SSEQ', {
        where: {
            UP_UID: req.body.UID,
            UP_PID: req.body.PID
        }
    })
    .then(result =>
        result
        ? result
        : 0
    )
    .then(dataValue => {
        parsingCodes.forEach((parsingCode, index) => {
            LOG.create({
                LOG_UID: parsingCode.UID,
                LOG_PID: parsingCode.PID,
                LOG_SSEQ: dataValue + 1,
                LOG_SEQ: parsingCode.SEQ,
                LOG_ETP: parsingCode.ETP,
                LOG_BID: parsingCode.BID,
                LOG_BUPID: parsingCode.BUPID,
                LOG_BTP: parsingCode.BTP,
                LOG_BVL: parsingCode.BVL
            })
            .then(() => {
                if(index === parsingCodes.length - 1) {
                    res.status(200).json("Log Insert Success");
                }
            })
            .catch(err => {
                console.error(err);
            })
        })
    })
    .catch(err => {
        console.err(err);
    })
    // .then(result => {
    //     if(!result)
    //         console.log("?!?!?");
    //     console.log(result);
    //     res.status(200).json("hmm...");
    // })
    // .then(results =>
    //     results && results.length && results.length > 0
    //     ? results
    //     : {
    //         UP_SSEQ: 1
    //     }
    // )
    // .then(dataValues  => {
    //     console.log(dataValues);
    //     res.status(200).json("Success");
    // })
    // .catch(err => {
    //     console.log(err);
    // })


    // SEQ도 올라가도록 넣어야 함, 또는 AUTO_INCREASE를 한 뒤, 다음 로그 때 1부터 시작하도록 설정해보기
    // 현재 0.001초가 겹치기에 SEQ를 증가시키지 않으면 Primary Key가 겹침
    // -> parsingCodes에 있는 parsingCode들이 배열로 있으므로 index 연산으로 간단히 해결
    // parsingCodes.forEach((parsingCode, index) => {
    //     LOG.create({LOG_UID: parsingCode.UID, LOG_PID: parsingCode.PID, LOG_SSEQ: 1, LOG_SEQ: index + 1,
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
});

app.listen(port, () => console.log(`Listening on port ${port}`));