const scriptName = "itaewon-bot";

const alreadyGameStartError = (gameType) => {
  const error = new Error(
    `${gameType} 게임이 진행중이에요\n별도의 예약없이 매장에 바로 방문하시면 게임을 즐기실 수 있어요`
  );
  return error;
};

const notExistReserveNickname = () => {
  const error = new Error(
    "닉네임을 입력해주셔야 예약이 가능해요~!\n예시: !몬스터 예약 컴테 20:00"
  );
  return error;
};

const notExistCancelNickname = () => {
  const error = new Error(
    "예약취소할 닉네임을 입력해주세요\n예시: !몬스터 예약취소 컴테"
  );
  return error;
};

const alreadyGameStartErrorForStaff = () => {
  const error = new Error(
    "단톡방집중~!\n예약을 받아야지 예약마감을 할 수 있어요~!"
  );
  return error;
};

const reservationInprogressError = () => {
  const error = new Error("단톡방에 집중하세요~!\n게임 예약진행중이에요~!");
  return error;
};

const notRoomMasterError = () => {
  const error = new Error("방 관리자만 사용할 수 있는 명령어입니다.");
  return error;
};

const notStaffError = () => {
  const error = new Error("스텝만 사용할 수 있는 명령어입니다.");
  return error;
};

const commandSyntaxError = () => {
  const error = new Error("잘못된 형식의 명령어입니다.");
  return error;
};

const reservationNotFoundError = (gameType) => {
  const error = new Error(
    `${gameType} 게임 예약을 찾을 수 없어요\n관리자에게 문의해주세요`
  );
  return error;
};

const duplicateReservationSessionError = () => {
  const error = new Error(
    "이이 예약을 진행했던 세션이에요\n관리자에게 문의해주세요"
  );
  return error;
};

const systemError = () => {
  const error = new Error(
    "시스템 오류가 발생했어요\n잠시 후 다시 시도해주세요\n문제가 지속될 경우 관리자에게 문의해주세요"
  );
  return error;
};

const RESERVATION_SERVER_URL = "https://fn-reservation.lomeone.com";
const STORE_BRANCH = "itaewon";

const GAME_TYPE = {
  MONSTER: "몬스터",
  SIT_AND_GO: "싯앤고",
  WEEKLY_TOURNAMENT: "주간토너먼트",
};

const reservationServiceApiCall = (path, method, requestBody) => {
  const response = org.jsoup.Jsoup.connect(RESERVATION_SERVER_URL + path)
    .header("Content-Type", "application/json")
    .timeout(10000)
    .ignoreContentType(true)
    .ignoreHttpErrors(true)
    .method(method);

  try {
    return method === org.jsoup.Connection.Method.POST
      ? response.requestBody(JSON.stringify(requestBody)).execute()
      : response.data(requestBody).execute();
  } catch (error) {
    throw systemError();
  }
};

const gameReservation = (gameType) => {
  const getReservationInfo = () => {
    const requestBody = {
      storeBranch: STORE_BRANCH,
      gameType,
    };

    const response = reservationServiceApiCall(
      "/reservation",
      org.jsoup.Connection.Method.GET,
      requestBody
    );

    const responseStatusCode = response.statusCode();

    if (responseStatusCode === 200) {
      const data = JSON.parse(response.body());

      if (data.status === "CLOSED") {
        throw alreadyGameStartError(gameType);
      }

      const gameCount = data.session % 100;
      const reservation = Object.entries(data.reservation);

      return { gameCount, reservation };
    }
    if (responseStatusCode === 404) {
      const errorData = JSON.parse(response.body());
      if (errorData.errorCode === "reservation/not-found") {
        throw reservationNotFoundError(gameType);
      }
    }
    throw systemError();
  };

  const reserve = (nicknames, time) => {
    if (nicknames.size === 0) {
      throw notExistReserveNickname();
    }
    const requestBody = {
      storeBranch: STORE_BRANCH,
      gameType,
      reservationUsers: Array.from(nicknames),
      reservationTime: time,
    };

    const response = reservationServiceApiCall(
      "/reservation",
      org.jsoup.Connection.Method.POST,
      requestBody
    );

    const responseStatusCode = response.statusCode();

    if (responseStatusCode === 200) {
      const data = JSON.parse(response.body());

      const gameCount = data.session % 100;
      const reservation = Object.entries(data.reservation);

      return { gameCount, reservation };
    }

    if (Math.floor(responseStatusCode / 100) === 4) {
      const errorData = JSON.parse(response.body());

      if (errorData.errorCode === "reservation/closed") {
        throw alreadyGameStartError();
      }

      if (errorData.errorCode === "reservation/not-found") {
        throw reservationNotFoundError(gameType);
      }
    }

    throw systemError();
  };

  const cancelReservation = (nicknames) => {
    if (nicknames.size === 0) {
      throw notExistCancelNickname();
    }
    const requestBody = {
      storeBranch: STORE_BRANCH,
      gameType,
      cancelUsers: Array.from(nicknames),
    };

    const response = reservationServiceApiCall(
      "/reservation/cancel",
      org.jsoup.Connection.Method.POST,
      requestBody
    );

    const responseStatusCode = response.statusCode();

    if (responseStatusCode === 200) {
      const data = JSON.parse(response.body());

      const gameCount = data.session % 100;
      const reservation = Object.entries(data.reservation);

      return { gameCount, reservation };
    }

    if (Math.floor(responseStatusCode / 100) === 4) {
      const errorData = JSON.parse(response.body());

      if (errorData.errorCode === "reservation/closed") {
        throw alreadyGameStartError();
      }

      if (errorData.errorCode === "reservation/not-found") {
        throw reservationNotFoundError(gameType);
      }
    }

    throw systemError();
  };

  const closeReservation = () => {
    const requestBody = {
      storeBranch: STORE_BRANCH,
      gameType,
    };

    const response = reservationServiceApiCall(
      "/reservation/close",
      org.jsoup.Connection.Method.POST,
      requestBody
    );

    const responseStatusCode = response.statusCode();

    if (responseStatusCode === 200) {
      const data = JSON.parse(response.body());
      return data;
    }

    if (Math.floor(responseStatusCode / 100) === 4) {
      const errorData = JSON.parse(response.body());

      if (errorData.errorCode === "reservation/closed") {
        throw alreadyGameStartErrorForStaff();
      }

      if (errorData.errorCode === "reservation/not-found") {
        throw reservationNotFoundError(gameType);
      }
    }

    throw systemError();
  };

  const openReservationNextGame = () => {
    const requestBody = {
      storeBranch: STORE_BRANCH,
      gameType,
    };

    const response = reservationServiceApiCall(
      "/reservation/start",
      org.jsoup.Connection.Method.POST,
      requestBody
    );

    const responseStatusCode = response.statusCode();

    if (responseStatusCode === 200) {
      const data = JSON.parse(response.body());

      const gameCount = data.session % 100;
      const reservation = Object.entries(data.reservation);

      return { gameCount, reservation };
    }

    if (Math.floor(responseStatusCode / 100) === 4) {
      const errorData = JSON.parse(response.body());

      if (errorData.errorCode === "reservation/in-progress") {
        throw reservationInprogressError();
      }

      if (errorData.errorCode === "reservation/not-found") {
        throw reservationNotFoundError(gameType);
      }
    }

    throw systemError();
  };

  const endToday = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const session = `${year}${month}${day}01`;

    const requestBody = {
      storeBranch: STORE_BRANCH,
      gameType,
      session,
    };

    const response = reservationServiceApiCall(
      "/reservation/close",
      org.jsoup.Connection.Method.POST,
      requestBody
    );

    const responseStatusCode = response.statusCode();

    if (responseStatusCode === 200) {
      const data = JSON.parse(response.body());

      return reserve(["영기"], "19:00");
    }

    if (Math.floor(responseStatusCode / 100) === 4) {
      const errorData = JSON.parse(response.body());

      if (errorData.errorCode === "reservation/already-reserved-session") {
        throw duplicateReservationSessionError();
      }
    }

    throw systemError();
  };

  return {
    getReservationInfo,
    reserve,
    cancelReservation,
    closeReservation,
    openReservationNextGame,
    endToday,
  };
};

const monsterGame = () => {
  const monsterReservation = gameReservation(GAME_TYPE.MONSTER);

  const getGameInformation = (gameCount, reservation) =>
    "✪ 𝗠 𝗢 𝗡 𝗦 𝗧 𝗘 𝗥 𝗚 𝗔 𝗠 𝗘 ✪\n\n" +
    "➜ MTT 토너먼트 (엔트리제한X)\n" +
    "➜ 300만칩 스타트 (150bb)\n" +
    "➜ 리바인 2회 (400만칩)\n" +
    "➜ 7엔트리당 시드 10만\n" +
    "➜ 획득시드 2만당 승점 +1점 / 바인 +1점\n\n" +
    "-" +
    gameCount +
    "부-\n" +
    "🅁 예약자 명단 (최소 6포이상)\n\n" +
    reservationListToString(reservation) +
    "\n" +
    "♠ 문의사항은 핑크왕관에게 1:1톡 부탁드립니다";

  const reservationListToString = (reservation) => {
    let result = "";
    for ([nickname, time] of reservation) {
      result += "★ " + nickname + " " + time + "\n";
    }

    if (reservation.length >= 10) {
      result += "★ \n★ \n";
    } else {
      const repeatCount = 10 - reservation.length;
      for (let i = 0; i < repeatCount; i++) {
        result += "★ \n";
      }
    }

    return result;
  };

  return {
    gameType: GAME_TYPE.MONSTER,
    getGameInformation: () => {
      const { gameCount, reservation } =
        monsterReservation.getReservationInfo();
      return getGameInformation(gameCount, reservation);
    },
    reserve: (nicknames, time) => {
      const { gameCount, reservation } = monsterReservation.reserve(
        nicknames,
        time
      );
      return getGameInformation(gameCount, reservation);
    },
    cancelReservation: (nicknames) => {
      const { gameCount, reservation } =
        monsterReservation.cancelReservation(nicknames);
      return getGameInformation(gameCount, reservation);
    },
    closeReservation: monsterReservation.closeReservation,
    openReservationNextGame: monsterReservation.openReservationNextGame,
    endToday: monsterReservation.endToday,
  };
};

let isDayFirst = true;

const sitAndGoGame = () => {
  const sitAndGoReservation = gameReservation(GAME_TYPE.SIT_AND_GO);

  const getGameInformation = (gameCount, reservation) => {
    const now = new Date();

    if (now.getHours() >= 20) {
      isDayFirst = false;
    }

    return (
      "🅂 🄸 🅃  &  🄶 🄾\n\n" +
      (gameCount === 1 && isDayFirst ? "🔥첫게임 2배 이벤트🔥\n\n" : "") +
      "➜ OTT 토너먼트 (엔트리제한X)\n" +
      "➜ 200만칩 스타트\n" +
      "➜ 리바인 2회 (300만칩)\n" +
      "➜ 3엔트리당 시드 1만\n" +
      "➜ 획득시드 2만당 승점 +1점\n\n" +
      "-" +
      gameCount +
      "부-\n" +
      "🅁 예약자 명단 (최소 5포이상)\n\n" +
      reservationListToString(reservation) +
      "\n" +
      "♠ 문의사항은 핑크왕관에게 1:1톡 부탁드립니다"
    );
  };

  const reservationListToString = (reservation) => {
    let result = "";

    for ([nickname, time] of reservation) {
      result += "★ " + nickname + " " + time + "\n";
    }

    if (reservation.length >= 10) {
      result += "★ \n★ \n";
    } else {
      const repeatCount = 10 - reservation.length;
      for (let i = 0; i < repeatCount; i++) {
        result += "★ \n";
      }
    }

    return result;
  };

  return {
    gameType: GAME_TYPE.SIT_AND_GO,
    getGameInformation: () => {
      const { gameCount, reservation } =
        sitAndGoReservation.getReservationInfo();
      return getGameInformation(gameCount, reservation);
    },
    reserve: (nicknames, time) => {
      const { gameCount, reservation } = sitAndGoReservation.reserve(
        nicknames,
        time
      );
      return getGameInformation(gameCount, reservation);
    },
    cancelReservation: (nicknames) => {
      const { gameCount, reservation } =
        sitAndGoReservation.cancelReservation(nicknames);
      return getGameInformation(gameCount, reservation);
    },
    closeReservation: sitAndGoReservation.closeReservation,
    openReservationNextGame: sitAndGoReservation.openReservationNextGame,
    endToday: () => {
      isDayFirst = true;
      sitAndGoReservation.endToday();
    },
  };
};

const weeklyTournamentGame = () => {
  const weeklyTournamentReservation = gameReservation(
    GAME_TYPE.WEEKLY_TOURNAMENT
  );

  const getGameInformation = (gameCount, reservation) =>
    "🅆 🄴 🄴 🄺 🄻 🅈\n" +
    "🅃 🄾 🅄 🅁 🄽 🄰 🄼 🄴 🄽 🅃 🅂\n\n" +
    "➜ 일요일 20:00 시작, 스타트칩 150만\n" +
    "➜ 바인 15,000원, 리바인 2회 200만칩\n" +
    "➜ 시드바인 가능 , 포인트바인 불가\n\n" +
    "  ★예약 Event ★\n" +
    "3레벨 이전 사전 예약 참가자들께는\n" +
    "기존 150만칩+ 50만칩\n" +
    "(총 200만칩 제공)\n" +
    "▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁\n" +
    "•1등: 온라인 토너먼트 참여권 지급\n" +
    "•바인 인원에 따라 시드 차등 지급\n" +
    "▔ ▔ ▔ ▔ ▔ ▔ ▔ ▔ ▔\n" +
    "🅁 예약자 명단 (최소 6포 이상)\n\n" +
    reservationListToString(reservation) +
    "\n" +
    "♠ 문의사항은 핑크왕관에게 1:1톡 부탁드립니다";

  const reservationListToString = (reservation) => {
    let result = "";
    let reservationCount = 0;

    for ([nickname, time] of reservation) {
      result += "★ " + nickname + "\n";
      if (++reservationCount % 10 === 0) {
        result += "🟰🟰🟰🟰🟰🟰🟰🟰🟰🟰🟰\n";
      }
    }

    if (reservation.length >= 20) {
      result += "★ \n★ \n";
    } else {
      const repeatCount = 20 - reservation.length;
      for (let i = 0; i < repeatCount; i++) {
        result += "★ \n";
        if (++reservationCount % 10 === 0) {
          result += "🟰🟰🟰🟰🟰🟰🟰🟰🟰🟰🟰\n";
        }
      }
    }

    return result;
  };

  return {
    gameType: GAME_TYPE.WEEKLY_TOURNAMENT,
    getGameInformation: () => {
      const { gameCount, reservation } =
        weeklyTournamentReservation.getReservationInfo();
      return getGameInformation(gameCount, reservation);
    },
    reserve: (nicknames, time) => {
      const { gameCount, reservation } = weeklyTournamentReservation.reserve(
        nicknames,
        time
      );
      return getGameInformation(gameCount, reservation);
    },
    cancelReservation: (nicknames) => {
      const { gameCount, reservation } =
        weeklyTournamentReservation.cancelReservation(nicknames);
      return getGameInformation(gameCount, reservation);
    },
    closeReservation: weeklyTournamentReservation.closeReservation,
    openReservationNextGame:
      weeklyTournamentReservation.openReservationNextGame,
    endToday: weeklyTournamentReservation.endToday,
  };
};

const COMMANDS = {
  RESERVATION_LIST: "!예약창",
  MONSTER: "!몬스터",
  MONSTER_SHORT: "!몬",
  SIT_AND_GO: "!싯앤고",
  SIT_AND_GO_SHORT: "!싯",
  WEEKLY_TOURNAMENT: "!주간토너먼트",
  WEEKLY_TOURNAMENT_SHORT: "!주토",
  END_TODAY: "!이태원마감",
};

const QUESTION_COMMANDS = "?이태원봇";

const ROOM_MASTER_COMMANDS = {
  MANAGE_STAFF: "!직원",
};

const isBotRoom = (room) => {
  const botRooms = [
    "파이널나인 이태원점",
    "이태원봇 테스트",
    "파이널나인 이태원점 봇관리방",
  ];
  return botRooms.includes(room);
};

const isCommand = (command) => {
  return Object.values(COMMANDS).includes(command);
};

const isRoomMasterCommand = (command) => {
  return Object.values(ROOM_MASTER_COMMANDS).includes(command);
};

const generateReservationValue = (value) => {
  const replaceValue = value.replace(/, /g, ",");

  if (replaceValue === "") {
    return { nicknames: new Set(), time: "현장" };
  }

  const valueTokenizer = replaceValue.split(" ");

  const nicknames = new Set(valueTokenizer[0].split(","));
  const time = valueTokenizer[1] || "현장";

  return { nicknames, time };
};

const isRoomMaster = (sender) => {
  return (
    sender === "파이널나인 이태원대장 영기" ||
    sender === "박재형" ||
    sender === "컴테"
  );
};

const isNotRoomMaster = (sender) => {
  return !isRoomMaster(sender);
};

const checkRoomMaster = (sender) => {
  if (isNotRoomMaster(sender)) {
    throw notRoomMasterError();
  }
};

const staffList = new Set();

const isStaff = (sender) => {
  return isRoomMaster(sender) || staffList.has(sender);
};

const isNotStaff = (sender) => {
  return !isStaff(sender);
};

const checkStaff = (sender) => {
  if (isNotStaff(sender)) {
    throw notStaffError();
  }
};

const addStaff = (nickname) => {
  staffList.add(nickname);
};

const removeStaff = (nickname) => {
  staffList.delete(nickname);
};

const getStaffList = () => "직원명단: " + Array.from(staffList).join(", ");

function response(
  room,
  msg,
  sender,
  isGroupChat,
  replier,
  imageDB,
  packageName
) {
  if (isBotRoom(room)) {
    const msgTokenizer = msg.split(" ");
    try {
      if (isCommand(msgTokenizer[0])) {
        if (msgTokenizer[0] === COMMANDS.RESERVATION_LIST) {
          try {
            replier.reply(monsterGame().getGameInformation());
          } catch (error) {}
          try {
            replier.reply(sitAndGoGame().getGameInformation());
          } catch (error) {
            replier.reply(error.message);
          }
          // replier.reply(weeklyTournamentGame().getGameInformation());
        } else {
          let game;
          switch (msgTokenizer[0]) {
            case COMMANDS.MONSTER:
            case COMMANDS.MONSTER_SHORT:
              game = monsterGame();
              break;
            case COMMANDS.SIT_AND_GO:
            case COMMANDS.SIT_AND_GO_SHORT:
              game = sitAndGoGame();
              break;
            case COMMANDS.WEEKLY_TOURNAMENT:
            case COMMANDS.WEEKLY_TOURNAMENT_SHORT:
              game = weeklyTournamentGame();
              break;
            default:
              break;
          }

          if (game !== undefined) {
            if (msgTokenizer[1]) {
              if (
                msgTokenizer[1] === "예약" ||
                msgTokenizer[1] === "예약취소"
              ) {
                const { nicknames, time } = generateReservationValue(
                  msg.slice(msgTokenizer[0].length + msgTokenizer[1].length + 2)
                );

                if (msgTokenizer[1] === "예약") {
                  replier.reply(game.reserve(nicknames, time));
                } else {
                  replier.reply(game.cancelReservation(nicknames));
                }
              } else if (msgTokenizer[1] === "예약창") {
                replier.reply(game.getGameInformation());
              } else if (msgTokenizer[1] === "예약시작") {
                checkStaff(sender);
                game.openReservationNextGame();
                replier.reply(game.getGameInformation());
              } else if (
                msgTokenizer[1] === "예약마감" ||
                msgTokenizer[1] === "마감"
              ) {
                checkStaff(sender);
                game.closeReservation();
                replier.reply(
                  `${game.gameType} 게임 예약이 마감되었습니다\n별도 예약없이 매장에 방문하시면 바로 게임을 즐기실 수 있어요`
                );
              } else {
                throw commandSyntaxError();
              }
            } else {
              throw commandSyntaxError();
            }
          } else {
            replier.reply(
              "금일 이태원점 마감하였습니다!\n오늘도 방문해주신 Fit밀리분들 감사합니다\n오늘 하루도 즐겁게 보내시고 저녁에 파나에서 만나요!"
            );
            monsterGame().endToday();
            sitAndGoGame().endToday();
            if (new Date().getDay() === 1) {
              weeklyTournamentGame().endToday();
            }
          }
        }
      } else if (msgTokenizer[0] === QUESTION_COMMANDS) {
        const question = msgTokenizer[1];
        if (question === "예약방법") {
          replier.reply(
            "1. 예약방법 \n" +
              "!게임종류 예약 닉네임 도착예정시간\n" +
              "ex1) !몬스터 예약 컴테 20:00\n" +
              "ex2) !싯앤고 예약 컴테,컴테1 20:00\n" +
              "♦️예약취소 - !몬스터 예약취소 컴테"
          );
        } else {
          replier.reply(
            "아직 예약방법 이외의 다른 질문은 답변을 못드려요ㅠㅠ\n" +
              "다른 질문도 받을 수 있도록 계속 발전해볼게요!"
          );
        }
      } else if (isRoomMasterCommand(msgTokenizer[0])) {
        checkRoomMaster(sender);
        if (msgTokenizer[0] === ROOM_MASTER_COMMANDS.MANAGE_STAFF) {
          const command = msgTokenizer[1];
          if (command === "등록") {
            addStaff(msgTokenizer[2]);
            replier.reply(getStaffList());
          } else if (command === "해제") {
            removeStaff(msgTokenizer[2]);
            replier.reply(getStaffList());
          } else if (command === "명단") {
            replier.reply(getStaffList());
          } else {
            throw commandSyntaxError();
          }
        }
      }
    } catch (error) {
      replier.reply(error.message);
    }
  }
}

// Below 4 methods are used to modify activity screen
function onCreate(savedInstanceState, activity) {
  const textView = new android.widget.TextView(activity);
  textView.setText("Hello, World!");
  textView.setTextColor(android.graphics.Color.DKGRAY);
  activity.setContentView(textView);
}

function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}
