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

app.post("/asdf", (req, res) => {
  console.log(req.body); //undefined

  let code = req.body.code.split("\n");
  let parsingCode = [
    {
      ID: 0,
      UPPER_ID: 0,
      TYPE: "",
      VALUE: ""
    }
  ];
  let parentId = [0];
  let preDepth = 0;
  const codeLength = code.length;
  for (let i = 0; i < codeLength - 1; i++) {
    let parsing = {};
    // id 설정
    parsing.ID = i + 1;
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
    parsing.UPPER_ID = parentId[parentId.length - 1];
    // type 찾기
    while (code[i][0] === " ") {
      code[i] = code[i].slice(2);
    }
    const codeSplit = code[i].split(" ");
    if (codeSplit[0] === "if") {
      parsing.TYPE = "IF";
      parsing.VALUE = code[i].slice(3, -1);
    } else if (codeSplit[0] === "while") {
      parsing.TYPE = "WHILE";
      parsing.VALUE = code[i].slice(6, -1);
    } else if (codeSplit[0] === "for") {
      parsing.TYPE = "FOR";
      parsing.VALUE = code[i].slice(4, -1);
    } else if (code[i].slice(0, 5) === "print") {
      parsing.TYPE = "PRINT";
      parsing.VALUE = code[i].slice(6, -1);
    } else if (codeSplit[1] === "=") {
      parsing.TYPE = "DEFINE";
      parsing.VALUE = codeSplit[2];
    }
    parsingCode.push(parsing);
  }
  console.log(parsingCode);
  
  res.status(200).json("success");
});

app.post('/problem', (req, res) => {
    var diff = req.body.diff;
    var cls = req.body.cls;

    PRB.findAll({
        attributes: ['PRB_CNT', 'PRB_HNT'],
        where: {
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