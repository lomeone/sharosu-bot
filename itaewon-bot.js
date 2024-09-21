const scriptName = "itaewon-bot";

const alreadyGameStartError = () => {
    const error = new Error("게임이 진행중이에요\n별도의 예약없이 매장에 바로 방문하시면 게임을 즐기실 수 있어요");
    return error;
};

const notExistReserveNickname = () => {
    const error = new Error("닉네임을 입력해주셔야 예약이 가능해요~!\n예시: !몬스터 예약 컴테 20:00");
    return error;
};

const notExistCancelNickname = () => {
    const error = new Error("예약취소할 닉네임을 입력해주세요\n예시: !몬스터 예약취소 컴테");
    return error;
};

const alreadyGameStartErrorForStaff = () => {
    const error = new Error("단톡방집중~!\n예약을 받아야지 예약마감을 할 수 있어요~!");
    return error;
};

const gameNotStartError = () => {
    const error = new Error("단톡방에 집중하세요~!\n게임 예약진행중이에요~!");
    return error;
};

const notStaffError = ()=> {
    const error = new Error("스텝만 사용할 수 있는 명령어입니다.");
    return error;
};

const commandSyntaxError = () => {
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
        reservationMap: new Map([["무너", "19:00"]]),
        gameStatus: GAME_STATUS.RESERVATION,
        reserve: (nicknamesString, timeInput) => {
            if (context.gameStatus === GAME_STATUS.START) {
                throw alreadyGameStartError();
            }
            if (!nicknamesString) {
                throw notExistReserveNickname();
            }
            const time = timeInput ? timeInput : "현장";
            const nicknames = nicknamesString.split(",");
            for (nickname of nicknames) {
                context.reservationMap.set(nickname, time);
            }
        },
        cancelReservation: (nicknamesString) => {
            if (context.gameStatus === GAME_STATUS.START) {
                throw alreadyGameStartError();
            }
            if (!nicknamesString) {
                throw notExistCancelNickname();
            }
            const nicknames = nicknamesString.split(",");
            for (nickname of nicknames) {
                const index = context.reservationMap.delete(nickname);
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
            context.reservationMap.clear();
            context.gameStatus = GAME_STATUS.RESERVATION;
        },
        endToday: () => {
            context.gameCount = 1;
            context.reservationMap.clear();
            context.reservationMap.set("무너", "19:00");
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
        reservationListToString() + "\n\n" +
        "⬛️ 문의사항은 핑크왕관에게 1:1톡 주세요";

    const reservationListToString = () => {
        let result = '';

        for ([key, value] of monsterReservation.reservationMap) {
            result += '◾️ ' + key + " " + value + '\n';
        }

        if (monsterReservation.reservationMap.size >= 10) {
            result += '◾ \n◾ \n';
        } else {
            const repeatCount = 10 - monsterReservation.reservationMap.size;
            for (let i = 0; i < repeatCount; i++) {
                result += '◾️ \n';
            }
        }

        return result;
    };

    return {
        gameName: "몬스터",
        getGameInformation: () => {
            if (monsterReservation.gameStatus === GAME_STATUS.START) {
                throw alreadyGameStartError();
            }

            return getGameInformation();
        },
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
        "🏴‍☠️Final NIne 4ㅑ로수길🏴‍☠️\n" +
        "🎲OTT -Sit & Go  \n\n" +
        "▪️" + sitAndReservation.gameCount + "부▪️\n\n" +
        "⏱️ Duration - 7 min\n\n" +
        "🔳 최소 인원 5명 시작\n" +
        "🔲 데일리와 바인금액 동일 / 시드1만 바인가능\n" +
        "🔳 1등 - 3엔트리당 10,000시드\n" +
        "🔲 1만시드당 주간 데일리 승점 +1점\n" +
        "🔳 바인 200만칩  / 리바인2회 300만칩 \n" +
        "🔲 최소인원 모이면 상시 진행\n\n" +
        "📋예약자 명단(최소 5포 이상)\n" +
        "📢빠르고 원활한 게임진행을 위해\n" +
        "예약시 방문예정 시간대를 함께 기재 부탁드립니다\n\n" +
        reservationListToString() + "\n\n" +
        "⬛️ 문의사항은 핑크왕관에게 1:1톡 주세요";

    const reservationListToString = () => {
        let result = '';

        for ([key, value] of sitAndReservation.reservationMap) {
            result += '◾️ ' + key + " " + value + '\n';
        }

        if (sitAndReservation.reservationMap.size >= 10) {
            result += '◾ \n◾ \n';
        } else {
            const repeatCount = 10 - sitAndReservation.reservationMap.size;
            for (let i = 0; i < repeatCount; i++) {
                result += '◾️ \n';
            }
        }

        return result;
    };

    return {
        gameName: "싯앤고",
        getGameInformation: () => {
            if (sitAndReservation.gameStatus === GAME_STATUS.START) {
                throw alreadyGameStartError();
            }

            return getGameInformation();
        },
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

        for ([key, value] of weeklyTournamentReservation.reservationMap) {
            result += '◾️ ' + key + '\n';
            if (++reservationCount % 10 === 0) {
                result += "🟰🟰🟰🟰🟰🟰🟰🟰🟰🟰🟰\n";
            }
        }

        if (weeklyTournamentReservation.reservationMap.size >= 20) {
            result += '◾ \n◾ \n';
        } else {
            const repeatCount = 20 - weeklyTournamentReservation.reservationMap.size;
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
        getGameInformation: () => {
            if (weeklyTournamentReservation.gameStatus === GAME_STATUS.RESERVATION) {
                return getGameInformation();
            }

            return "주간토너 예약이 마감되었습니다";
        },
        reserve: (nicknamesString, timeInput) => {
            weeklyTournamentReservation.reserve(nicknamesString, timeInput);
        },
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

const isStaff = (sender) => {
    return sender.includes("(Manager)") || sender.includes("(STAFF)") || sender.includes("이태원대장 무너") || sender === "A3";
};

const isNotStaff = (sender) => {
    return !isStaff(sender);
};

const isBotRoom = (roomName) => {
    const botRooms = ["파이널나인 이태원점", "이태원봇 테스트"];
    return botRooms.includes(roomName);
};

const reserveValues = (value) => {
    const replaceValue = value.replace(", ", ",");

    const valueTokenizer = replaceValue.split(" ");

    return valueTokenizer;
};

const replaceGap = (value) => {
    return value.replace(/\s+/g, "");
};

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (isBotRoom(room)) {
        const questionCommand = "?무너봇";
        const commandList = ["!몬스터", "!몬", "!싯앤고", "!싯", "!주토", "!이태원마감"];
        const msgTokenizer = msg.split(" ");

        try {
            if (commandList.includes(msgTokenizer[0])) {
                let gameType;
                switch (msgTokenizer[0]) {
                    case "!몬스터":
                    case "!몬":
                        gameType = monster;
                        break;
                    case "!싯앤고":
                    case "!싯":
                        gameType = sitAndGo;
                        break;
                    case "!주토":
                        gameType = weeklyTournament;
                        break;
                    case "!이태원마감":
                        checkStaff(sender);
                        break;
                    default:
                        break;
                }

                if (gameType) {
                    if (msgTokenizer[1]) {
                        switch (msgTokenizer[1]) {
                            case "예약":
                                const [reserveString, time] = reserveValues(msg.slice(msgTokenizer[0].length + msgTokenizer[1].length + 2));
                                gameType.reserve(reserveString, time);
                                replier.reply(gameType.getGameInformation());
                                break;
                            case "예약취소":
                                const reserveList = replaceGap(msg.slice(msgTokenizer[0].length + msgTokenizer[1].length + 2));
                                gameType.cancelReservation(reserveList);
                                replier.reply(gameType.getGameInformation());
                                break;
                            case "예약창":
                                replier.reply(gameType.getGameInformation());
                                break;
                            case "예약시작":
                                checkStaff(sender);
                                gameType.reserveNextGame();
                                replier.reply(gameType.getGameInformation());
                                break;
                            case "예약마감":
                            case "마감":
                                checkStaff(sender);
                                gameType.startGame();
                                replier.reply(gameType.gameName + "게임 예약이 마감되었습니다\n별도 예약없이 매장에 방문하시면 바로 게임을 즐기실 수 있어요");
                                break;
                            default:
                                throw commandSyntaxError();
                        }
                    } else {
                        throw commandSyntaxError();
                    }
                } else {
                    replier.reply("금일 이태원점 마감하였습니다!\n오늘도 방문해주신 이태원점 가족분들 감사합니다\n오늘 하루도 즐겁게 보내시고 저녁에 파나에서 만나요!");
                    monster.endToday();
                    sitAndGo.endToday();
                    weeklyTournament.endToday();
                }
            } else if (questionCommand === msgTokenizer[0]) {
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
            }
        } catch(error) {
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
