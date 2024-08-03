const scriptName = "test";

const alreadyGameStartError = () => {
    const error = new Error("이미 게임 시작했습니다\n매장에 바로 방문하시면 게임을 즐기실 수 있어요");
    return error;
};

const alreadyGameStartErrorForStaff = () => {
    const error = new Error("이미 게임 시작했습니다\n레자마감되면 다음 게임 예약을 올려주세요");
    return error;
};

const gameNotStartError = () => {
    const error = new Error("아직 게임이 시작되지 않았습니다.\n다음 게임 예약은 현재 예약받는 게임이 시작된 이후에 다시 올려드려요");
    return error;
};

const notStaffError = ()=> {
    const error = new Error("직원만 사용할 수 있는 명령어입니다.");
    return error;
};

const syntaxError = () => {
    const error = new Error("잘못된 형식의 명령어입니다.");
    return error;
};

// Define the GAME_STATUS enum
const GAME_STATUS = {
    RESERVATION: 0,
    START: 1
};

const gameReservationInterface = () => {
    const context = {
        gameCount: 1,
        reservationList: [],
        gameStatus: GAME_STATUS.RESERVATION,
        reserve: (nicknamesString) => {
            if (context.gameStatus === GAME_STATUS.START) {
                throw alreadyGameStartError();
            }
            const nicknames = nicknamesString.split(",");
            for (nickname of nicknames) {
                context.reservationList.push(nickname);
            }
        },
        cancelReservation: (nicknamesString) => {
            if (context.gameStatus === GAME_STATUS.START) {
                throw alreadyGameStartError();
            }
            const nicknames = nicknamesString.split(",");
            for (nickname of nicknames) {
                const index = context.reservationList.indexOf(nickname);
                context.reservationList.splice(index, 1);
            }
        },
        startGame: () => {
            if (context.gameStatus === GAME_STATUS.START) {
                throw alreadyGameStartErrorForStaff();
            }
            context.gameStatus = GAME_STATUS.START;
        },
        reserveNextGame: () => {
            if (context.gameStatus === GAME_STATUS.RESERVATION) {
                throw gameNotStartError();
            }
            context.gameCount++;
            context.reservationList.length = 0;
            context.gameStatus = GAME_STATUS.RESERVATION;
        },
        endToday: () => {
            context.gameCount = 1;
            context.reservationList.length = 0;
            context.gameStatus = GAME_STATUS.RESERVATION;
        }
    };

    return context;
};

const createMonster = () => {
    const monsterReservation = gameReservationInterface();

    const getGameInformation = () =>
        "🏴‍☠️Final Nine 4ㅑ로수길 🏴‍☠️\n" +
        "🎲Monster stack game\n\n" +
        "▪️" + monsterReservation.gameCount + "부▪️\n\n" +
        "⬛️◼️◾️▪️▪️◾️◼️⬛️\n" +
        "▪️7엔트리당 시드 10만\n" +
        "◾️300만칩 시작 (150BB)\n" +
        "▪️리바인 2회 (400만칩)\n" +
        "◾️획득시드 2만당 몬스터 승점 1점\n" +
        "▪️바인,리바인시 몬스터 승점 1점\n" +
        "⬛️◼️◾️▪️▪️◾️◼️⬛️\n\n" +
        (monsterReservation.gameCount == 1 ? "‼️1부 한정 얼리칩 +40‼️\n\n" : "") +
        "❕예약자 명단 (최소 6포 이상/12포 밸런싱 )\n" +
        "📢빠르고 원활한 게임진행을 위해\n" +
        "예약시 방문예정 시간대를 함께 기재 부탁드립니다\n\n" +
        "◾️ A3\n" +
        reservationListToString() + "\n\n" +
        "⬛️ 문의사항은 핑크왕관에게 1:1톡 주세요";

    const reservationListToString = () => {
        let result = '';

        for (item of monsterReservation.reservationList) {
            result += '◾️ ' + item + '\n';
        }

        if (monsterReservation.reservationList.length >= 10) {
            result += '◾ \n◾ \n';
        } else {
            const repeatCount = 10 - monsterReservation.reservationList.length;
            for (let i = 0; i < repeatCount; i++) {
                result += '◾️ \n';
            }
        }

        return result;
    };

    return {
        gameName: "몬스터",
        getGameInformation: getGameInformation,
        reserve: monsterReservation.reserve,
        cancelReservation: monsterReservation.cancelReservation,
        startGame: monsterReservation.startGame,
        reserveNextGame: monsterReservation.reserveNextGame,
        endToday: monsterReservation.endToday
    };
};

const createSitAndGo = () => {
    const sitAndReservation = gameReservationInterface();

    const getGameInformation = () =>
        "🏴‍☠️Final Nine 4ㅑ로수길 🏴‍☠️\n" +
        "싯앤고 stack game\n\n" +
        "▪️" + sitAndReservation.gameCount + "부▪️\n\n" +
        "⬛️◼️◾️▪️▪️◾️◼️⬛️\n" +
        "▪️7엔트리당 시드 10만\n" +
        "◾️300만칩 시작 (150BB)\n" +
        "▪️리바인 2회 (400만칩)\n" +
        "◾️획득시드 2만당 몬스터 승점 1점\n" +
        "▪️바인,리바인시 몬스터 승점 1점\n" +
        "⬛️◼️◾️▪️▪️◾️◼️⬛️\n\n" +
        (sitAndReservation.gameCount == 1 ? "‼️1부 한정 얼리칩 +40‼️\n\n" : "") +
        "❕예약자 명단 (최소 6포 이상/12포 밸런싱 )\n" +
        "📢빠르고 원활한 게임진행을 위해\n" +
        "예약시 방문예정 시간대를 함께 기재 부탁드립니다\n\n" +
        "◾️ A3\n" +
        reservationListToString() + "\n\n" +
        "⬛️ 문의사항은 핑크왕관에게 1:1톡 주세요";

    const reservationListToString = () => {
        let result = '';

        for (item of sitAndReservation.reservationList) {
            result += '◾️ ' + item + '\n';
        }

        if (sitAndReservation.reservationList.length >= 10) {
            result += '◾ \n◾ \n';
        } else {
            const repeatCount = 10 - sitAndReservation.reservationList.length;
            for (let i = 0; i < repeatCount; i++) {
                result += '◾️ \n';
            }
        }

        return result;
    };

    return {
        gameName: "싯앤고",
        getGameInformation: getGameInformation,
        reserve: sitAndReservation.reserve,
        cancelReservation: sitAndReservation.cancelReservation,
        startGame: sitAndReservation.startGame,
        reserveNextGame: sitAndReservation.reserveNextGame,
        endToday: sitAndReservation.endToday
    };
};

const createWeeklyTournament = () => {
    const weeklyTournamentReservation = gameReservationInterface();

    const getGameInformation = () =>
        "🏴‍☠️Final Nine 4ㅑ로수길 🏴‍☠️\n" +
        "🎲 MTT-Weekly Tournaments \n\n" +
        "⏱️ Duration - 10 min\n\n" +
        "◾️일요일 20:00 시작, 스타트칩 150만\n" +
        "▪️바인 15,000원, 리바인 2회 200만칩\n" +
        "◾️시드바인 가능 , 포인트바인 불가\n\n" +
        "▪️예약 Event▪️\n" +
        "3레벨 이전 사전 예약 참가자들께는\n" +
        "기존 150만칩+ 50만칩\n" +
        "(총 200만칩 제공)\n\n" +
        "⬛️◼️◾️▪️▪️◾️◼️⬛️\n" +
        "•1등: 온라인 토너먼트 참여권 지급\n" +
        "•바인 인원에 따라 시드 차등지급\n" +
        "⬛️◼️◾️▪️▪️◾️◼️⬛️\n\n" +
        "📋예약자 명단 (최소 6포 이상)\n" +
        reservationListToString() + "\n\n" +
        "🔳 문의사항은 핑크왕관에게 1:1톡 부탁드립니다";

    const reservationListToString = () => {
        let result = '';
        let reservationCount = 0;

        for (item of weeklyTournamentReservation.reservationList) {
            result += '◾️ ' + item + '\n';
            if (++reservationCount % 10 === 0) {
                result += "🟰🟰🟰🟰🟰🟰🟰🟰🟰🟰🟰\n";
            }
        }

        if (weeklyTournamentReservation.reservationList.length >= 20) {
            result += '◾ \n◾ \n';
        } else {
            const repeatCount = 20 - weeklyTournamentReservation.reservationList.length;
            for (let i = 0; i < repeatCount; i++) {
                result += '◾️ \n';
                if (++reservationCount % 10 === 0) {
                    result += "🟰🟰🟰🟰🟰🟰🟰🟰🟰🟰🟰\n";
                }
            }
        }

        return result;
    };

    return {
        gameName: "주간토너",
        getGameInformation: getGameInformation,
        reserve: weeklyTournamentReservation.reserve,
        cancelReservation: weeklyTournamentReservation.cancelReservation,
        startGame: weeklyTournamentReservation.startGame,
        reserveNextGame: weeklyTournamentReservation.reserveNextGame,
        endToday: weeklyTournamentReservation.endToday
    };
};

const monster = createMonster();
const sitAndGo = createSitAndGo();
const weeklyTournament = createWeeklyTournament();

const checkStaff = (sender) => {
    if (isNotStaff(sender)) {
        throw notStaffError();
    }
};

const isNotStaff = (sender) => {
    return !sender.includes("STAFF");
};

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    const commandList = ["!몬스터", "!싯앤고", "!주토", "!샤로수마감"];
    const msgTokenizer = msg.split(" ");
    try {
        if (commandList.includes(msgTokenizer[0])) {
            let gameType;
            switch (msgTokenizer[0]) {
                case "!몬스터":
                    gameType = monster;
                    break;
                case "!싯앤고":
                    gameType = sitAndGo;
                    break;
                case "!주토":
                    gameType = weeklyTournament;
                    break;
                case "!샤로수마감":
                    checkStaff(sender);
                    break;
                default:
                    break;
            }

            if (gameType !== undefined) {
                switch (msgTokenizer[1]) {
                    case "예약":
                        gameType.reserve(msgTokenizer[2]);
                        replier.reply(gameType.getGameInformation());
                        break;
                    case "예약취소":
                        gameType.cancelReservation(msgTokenizer[2]);
                        replier.reply(gameType.getGameInformation());
                        break;
                    case "현황":
                        replier.reply(gameType.getGameInformation());
                        break;
                    case "예약시작":
                        checkStaff(sender);
                        gameType.reserveNextGame();
                        replier.reply(gameType.getGameInformation());
                        break;
                    case "예약마감":
                        checkStaff(sender);
                        gameType.startGame();
                        replier.reply(gameType.gameName + "게임이 곧 시작됩니다.\n매장에 방문하시면 바로 게임을 즐기실 수 있어요");
                        break;
                    default:
                        throw syntaxError();
                }
            } else {
                replier.reply("금일 샤로수점 마감하였습니다!");
                monster.endToday();
                sitAndGo.endToday();
                weeklyTournament.endToday();
                const now = new Date();
                if (now.getDay() === 0) {
                    replier.reply(weeklyTournament.getGameInformation());
                } else {
                    replier.reply(monster.getGameInformation());
                    replier.reply(sitAndGo.getGameInformation());
                }
            }
        }
    } catch(error) {
        replier.reply(error.message);
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
