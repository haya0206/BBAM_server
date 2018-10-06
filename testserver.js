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
        allowNull: false,
        autoIncrement: true
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

const LOG = sequelize.define('LOG', {
    LOG_DTM: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    LOG_UID: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false
    },
    LOG_PID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    LOG_SSEQ: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    // 같은 문제에서 몇 번째로 들어오는 로그인가 -> performance
    LOG_SEQ: {
        type: Sequelize.INTEGER
    },
    LOG_ETP: {
        type: Sequelize.STRING(10)
    },
    LOG_BID: {
        type: Sequelize.INTEGER
    },
    LOG_BUPID: {
        type: Sequelize.INTEGER
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

    let parsingCode = [
        {
            UID: "",
            PID: 0,
            ETP: "",
            BID: 0,
            BUPID: 0,
            BTP: "",
            BVL: ""
        }
    ];
    let parentId = [0];
    let preDepth = 0;
    const codeLength = code.length;
    for (let i = 0; i < codeLength - 1; i++) {
        let parsing = {};
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
        parsing.ETP = req.body.ETP;
        parsing.PID = req.body.PID;
        parsing.UID = req.body.UID;
        parsingCode.push(parsing);
    }
    console.log(parsingCode);

    // parsing이 됐다고 가정하고 DB에 저장
    // LOG_SSEQ와 LOG_SEQ는 별도의 공정이 필요, Mysql의 SELECT 역할을 하는 Sequelize 기능 필요, 현재는 임의의 값
    LOG.create({LOG_UID: parsingCode.UID, LOG_PID: parsingCode.PID, LOG_SSEQ: 1, LOG_SEQ: 1,
    LOG_ETP: parsingCode.ETP, LOG_BID: parsingCode.BID, LOG_BUPID: parsingCode.BUPID, LOG_BTP: parsingCode.BTP, LOG_BVL: parsingCode.BVL})
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.error(err);
    })
    
    // res.status(200).json("success");
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