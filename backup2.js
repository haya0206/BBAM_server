const express = require("express");
const cors = require("cors");
const Sequelize = require("sequelize");


sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch(err => {
    console.error("Unable to connect to database:", err);
  });
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const http = require("http").Server(app);
const io = require("socket.io")(http);

const USR = sequelize.define("USR", {
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
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP(3)")
  }
});

const GM = sequelize.define("GM", {
  GM_ID: {
    type: Sequelize.STRING(10),
    primaryKey: true,
    allowNull: false
  },
  GM_EXP: {
    type: Sequelize.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  GM_RTN: {
    type: Sequelize.INTEGER.UNSIGNED
  }
});

const PRB = sequelize.define("PRB", {
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

const USR_PRB = sequelize.define("USR_PRB", {
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
  UP_PNT: {
    type: Sequelize.INTEGER.UNSIGNED
  },
  UP_DTM: {
    type: Sequelize.DATE(3),
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP(3)")
  },
  UP_XML: {
    type: Sequelize.STRING(20000)
  }
});

const LOG = sequelize.define("LOG", {
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
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP(3)")
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
// 또한 풀었는지 여부를 보내달라고 함
app.use(express.static("build"));
app.get("/*", function(req, res) {
  res.sendFile("index.html", { root: "./build" }, function(err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

app.post("/login", (req, res) => {
  var id = req.body.ID;
  var pw = req.body.PW;

  USR.findAll({
    where: {
      USR_ID: id,
      USR_PW: pw
    }
  })
    .then(
      results => (results && results.length && results.length > 0 ? 200 : 401)
    )
    .then(result => {
      // console.log(result);
      res.status(result).json("login");
    })
    .catch(err => {
      console.error(err);
    });
});

app.post("/mainPage", (req, res) => {
  var id = req.body.ID;

  GM.findAll({
    attributes: ["GM_EXP", "GM_RTN"],
    where: {
      GM_ID: id
    }
  })
    .then(results => {
      var lv = 1;
      var exp = results[0].dataValues.GM_EXP;
      while (exp > lv * 100) {
        exp -= lv * 100;
        lv++;
      }
      results[0].dataValues.GM_LV = lv;
      results[0].dataValues.GM_EXP = exp;
      res.status(200).json(results);
    })
    .catch(err => {
      console.error(err);
    });
});

app.post("/getProblemList", (req, res) => {
  var diff = req.body.diff;
  // var cls = req.body.cls;

  PRB.findAll({
    attributes: ["PRB_ID", "PRB_CLS", "PRB_NM"],
    where: {
      PRB_DIFF: diff //,
      // PRB_CLS: cls
    }
  })
    .then(
      results =>
        results && results.length && results.length > 0
          ? results
          : {
              PRB_ID: 0,
              PRB_CLS: null // 임시로 추가
            }
    )
    .then(dataValues => {
      //console.log(dataValues);
      res.status(200).json(dataValues);
    })
    .catch(err => {
      console.log(err);
    });
});

// 문제 리스트에서 문제 선택했을 시 문제 정보 전달(return 문제 내용, 문제 힌트, 입력값, 출력값)
// 문제에서 사용하는 XML도 보내기               // 완료
app.post("/getProblem", (req, res) => {
  var uid = req.body.UID;
  var pid = req.body.PID;

  USR_PRB.max("UP_SSEQ", {
    where: {
      UP_UID: uid,
      UP_PID: pid
    }
  })
    .then(result => (result ? result : 0))
    .then(seq => {
      USR_PRB.findAll({
        attributes: ["UP_XML"],
        where: {
          UP_UID: uid,
          UP_PID: pid,
          UP_SSEQ: seq
        }
      })
        .then(
          result =>
            result && result.length && result.length > 0 ? result : null
        )
        .then(xml => {
          PRB.findAll({
            attributes: [
              "PRB_DIFF",
              "PRB_CLS",
              "PRB_NM",
              "PRB_CNT",
              "PRB_HNT",
              "PRB_IN",
              "PRB_OUT",
              "PRB_XML"
            ],
            where: {
              PRB_ID: pid
            }
          })
            .then(
              results =>
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
              if (xml === null) {
                dataValues.push({ UP_XML: null });
              } else {
                dataValues.push(xml[0]);
              }
              //console.log(dataValues);
              res.status(200).json(dataValues);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
});

// 문제를 제출하고 채점받은 결과를 저장
app.post("/submit", (req, res) => {
  var uid = req.body.UID;
  var pid = req.body.PID;
  var crct = req.body.crct;
  var xml = req.body.xml;

  // 해당 유저가 특정 문제를 몇 번 째로 푸는 것인가?
  USR_PRB.max("UP_SSEQ", {
    where: {
      UP_UID: uid,
      UP_PID: pid
    }
  })
    .then(result => (result ? result : 0))
    .then(dataValue => {
      // 몇 번 째로 푸는 지, 맞았는지, 제출한 xml은 무엇인지 추가
      USR_PRB.create({
        UP_UID: uid,
        UP_PID: pid,
        UP_SSEQ: dataValue + 1,
        UP_CRCT: crct,
        UP_PNT: 0,
        UP_XML: xml
      })
        .then(() => {
          // 문제를 맞았다면
          if (crct === 1) {
            // 푼 문제인가를 확인
            USR_PRB.findAll({
              attributes: ["UP_CRCT"],
              where: {
                UP_PID: pid
              }
            })
              .then(results => {
                var ri;
                for (ri = 0; ri < results.length - 1; ri++) {
                  if (results[ri].dataValues.UP_CRCT === 1) {
                    break;
                  }
                }

                // 추가 점수(100)에 대한 연산식(실행시간, 중간에 오래 멈춤, 패턴 반복, 한 번에 많은 행동, 블록의 길이)
                var points = {
                  TIME: 0,
                  STOP: 0,
                  MUCH: 0,
                  REPEAT: 0,
                  LENGTH: 0
                };
                var addedPoint = 0;
                var time = req.body.time;
                var stop = req.body.stop;
                var much = req.body.much;

                if (time < 2000.0) {
                  addedPoint += 30;
                  points.TIME += 30;
                }
                if (stop === 0) {
                  addedPoint += 20;
                  points.STOP += 20;
                }
                if (much === 0) {
                  addedPoint += 15;
                  points.MUCH += 15;
                }
                if (xml.length < 10000) {
                  addedPoint += 15;
                  points.LENGTH += 15;
                }

                // 제출한 문제의 시도 횟수 확인
                LOG.max("LOG_SEQ", {
                  where: {
                    LOG_UID: uid,
                    LOG_PID: pid,
                    LOG_SSEQ: dataValue + 1
                  }
                })
                  .then(targetSeq => {
                    // 제출한 문제의 최종 블록 형태를 가져옴
                    LOG.findAll({
                      attributes: ["LOG_BVL"],
                      where: {
                        LOG_UID: uid,
                        LOG_PID: pid,
                        LOG_SEQ: targetSeq,
                        LOG_SSEQ: dataValue + 1
                      }
                    })
                      .then(logValues => {
                        // 3줄 이상의 반복 패턴이 있는지 확인
                        var len = logValues.length;
                        var i, j;
                        var repeat = 0;

                        for (i = 0; i < len - 2; i++) {
                          for (j = i + 1; j < i + 3; j++) {
                            if (
                              JSON.stringify(logValues[j]) !=
                              JSON.stringify(logValues[i])
                            ) {
                              break;
                            }
                          }
                          if (j === i + 3) {
                            repeat = 1;
                            break;
                          }
                        }

                        if (repeat === 0) {
                          addedPoint += 20;
                          points.REPEAT += 20;
                        }

                        // 제출한 문제의 추가 점수 정보 저장
                        USR_PRB.update(
                          {
                            UP_PNT: addedPoint
                          },
                          {
                            where: {
                              UP_UID: uid,
                              UP_PID: pid,
                              UP_SSEQ: dataValue + 1
                            }
                          }
                        )
                          .then(() => {
                            // 처음 맞은 문제라면
                            if (ri === results.length - 1) {
                              // 사용자의 경험치를 가져옴
                              GM.findAll({
                                attributes: ["GM_EXP"],
                                where: {
                                  GM_ID: uid
                                }
                              })
                                .then(experience => {
                                  // 문제의 점수를 가져옴
                                  PRB.findAll({
                                    attributes: ["PRB_RTN"],
                                    where: {
                                      PRB_ID: pid
                                    }
                                  })
                                    .then(rating => {
                                      // 사용자의 경험치에 문제의 점수와 추가 점수를 추가
                                      GM.update(
                                        {
                                          GM_EXP:
                                            experience[0].dataValues.GM_EXP +
                                            rating[0].dataValues.PRB_RTN +
                                            addedPoint
                                        },
                                        {
                                          where: {
                                            GM_ID: uid
                                          }
                                        }
                                      )
                                        .then(() => {
                                          res.status(200).json(points);
                                        })
                                        .catch(err => {
                                          console.error(err);
                                        });
                                    })
                                    .catch(err => {
                                      console.error(err);
                                    });
                                })
                                .catch(err => {
                                  console.error(err);
                                });
                            }
                            // 이미 맞은 문제라면
                            else {
                              // 지금까지 가장 높았던 추가 점수를 가져옴
                              USR_PRB.max("UP_PNT", {
                                where: {
                                  UP_UID: uid,
                                  UP_PID: pid,
                                  UP_SSEQ: {
                                    [Sequelize.Op.lt]: dataValue + 1
                                  },
                                  UP_CRCT: 1
                                }
                              })
                                .then(maxAddedPoint => {
                                  // 제출한 추가점수가 현재까지 푼 추가점수보다 높다면
                                  if (addedPoint > maxAddedPoint) {
                                    // 사용자의 경험치를 가져옴
                                    GM.findAll({
                                      attributes: ["GM_EXP"],
                                      where: {
                                        GM_ID: uid
                                      }
                                    })
                                      .then(experience => {
                                        // 사용자 경험치를 갱신
                                        GM.update(
                                          {
                                            GM_EXP:
                                              experience[0].dataValues.GM_EXP +
                                              addedPoint -
                                              maxAddedPoint
                                          },
                                          {
                                            where: {
                                              GM_ID: uid
                                            }
                                          }
                                        )
                                          .then(() => {
                                            res.status(200).json(points);
                                          })
                                          .catch(err => {
                                            console.error(err);
                                          });
                                      })
                                      .catch(err => {
                                        console.error(err);
                                      });
                                  } else {
                                    res.status(200).json(points);
                                  }
                                })
                                .catch(err => {
                                  console.error(err);
                                });
                            }
                          })
                          .catch(err => {
                            console.error(err);
                          });
                      })
                      .catch(err => {
                        console.error(err);
                      });
                  })
                  .catch(err => {
                    console.error(err);
                  });
              })
              .catch(err => {
                console.error(err);
              });
          }
          // 문제를 틀렸다면
          else {
            res.status(200).json("Incorrect");
          }
        })
        .catch(err => {
          console.error(err);
        });
    })
    .catch(err => {
      console.error(err);
    });
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
    if (code[i] === "") continue;
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

  USR_PRB.max("UP_SSEQ", {
    where: {
      UP_UID: req.body.UID,
      UP_PID: req.body.PID
    }
  })
    .then(result => (result ? result : 0))
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
            if (index === parsingCodes.length - 1) {
              res.status(200).json("Log Insert Success");
            }
          })
          .catch(err => {
            console.error(err);
          });
      });
    })
    .catch(err => {
      console.err(err);
    });
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
let users = {};
let rooms = {};
let roomIdCount = 0;
io.on("connection", socket => {
  const { id, name, rating, rank } = socket.handshake.query;
  const socketId = socket.id;
  users[socketId] = { name, id, rating, rank };
  socket.emit("logined", { socketId, name, id, rating, rank });
  socket.broadcast.emit("addList", { socketId, name, id, rating, rank });
  socket.on("reqList", () => {
    socket.emit("list", users);
    console.log("List request");
  });
  socket.on("invite", (user, anotherUser) => {
    io.to(user.socketId).emit("invite", anotherUser);
  });
  socket.on("inviteAllow", (user, bool) => {
    if (bool) {
      rooms[`${roomIdCount}`] = { members: [id, user.id] };
      socket.emit("roomId", `${roomIdCount}`, "1");
      socket.join(`${roomIdCount}`);
    }
    io.to(user.socketId).emit("inviteAllow", bool, `${roomIdCount}`, "1");
  });
  socket.on("join", () => {
    socket.join(`${roomIdCount}`);
    roomIdCount++;
  });
  socket.on("success", id => {
    socket.broadcast.to(id).emit("end");
    console.log("성공", id, rooms);
    io.of("https://bbam.tk")
      .in(id)
      .clients((error, socketIds) => {
        if (error) throw error;

        socketIds.forEach(socketId =>
          io.of("https://bbam.tk").adapter.remoteLeave(socketId, id)
        );
      });
    delete rooms[id];
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("delList", socketId);
    delete users[socketId];
    console.log("Client disconnected");
  });
});
http.listen(port, () => console.log(`Listening on port ${port}`));
