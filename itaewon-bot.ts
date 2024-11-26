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

const notRoomMasterError = ()=> {
    const error = new Error("방 관리자만 사용할 수 있는 명령어입니다.");
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

const RESERVATION_SERVER_URL: string = "https://fn-reservation.lomeone.com";

const enum GAME_TYPE {
    MONSTER = "몬스터",
    SIT_AND_GO = "싯앤고",
    WEEKLY_TOURNAMENT = "주간토너먼트"
}

const gameReservation = (gameType: GAME_TYPE) => {
    return {
        reservationInfo: (): {gameCount: number, reservation: Map<string, string>} => {
            const response = org.jsoup.Jsoup.connect(RESERVATION_SERVER_URL + "/reservation")
                .data("storeBranch", "itaewon")
                .data("gameType", gameType)
                .timeout(5000)
                .ignoreContentType(true)
                .get();
            
            const data = JSON.parse(response.text());

            const gameCount: number = data.session % 100;
            const reservation: Map<string, string> = data.reservation;

            return { gameCount, reservation };
        },
        reserve: (nicknames: Set<string>, time: string): {gameCount: number, reservation: Map<string, string>} => {
            const requestBody = {
                storeBranch: "itaewon",
                gameType,
                reservationUsers: nicknames,
                reservationTime: time,
            };

            const response = org.jsoup.Jsoup.connect(RESERVATION_SERVER_URL + "/reservation")
                .requestBody(JSON.stringify(requestBody))
                .timeout(5000)
                .ignoreContentType(true)
                .post();

            const data = JSON.parse(response.text());

            const gameCount: number = data.session % 100;
            const reservation: Map<string, string> = data.reservation;
            return { gameCount, reservation };
        },
        cancelReservation: (nicknames: Set<string>): {gameCount: number, reservation: Map<string, string>} => {
            const requestBody = {
                storeBranch: "itaewon",
                gameType,
                cancelUsers: nicknames,
            };

            const response = org.jsoup.Jsoup.connect(RESERVATION_SERVER_URL + "/reservation/cancel")
                .requestBody(JSON.stringify(requestBody))
                .timeout(5000)
                .ignoreContentType(true)
                .delete();

            const data = JSON.parse(response.text());

            const gameCount: number = data.session % 100;
            const reservation: Map<string, string> = data.reservation;
            return { gameCount, reservation };
        },
        startGame: () => {
            const requestBody = {
                storeBranch: "itaewon",
                gameType,
            };

            const response = org.jsoup.Jsoup.connect(RESERVATION_SERVER_URL + "/reservation/close")
                .requestBody(JSON.stringify(requestBody))
                .timeout(5000)
                .ignoreContentType(true)
                .post();
            
            const data = JSON.parse(response.text());
        },
        openReservationNextGame: (): {gameCount: number, reservation: Map<string, string>} => {
            const requestBody = {
                storeBranch: "itaewon",
                gameType,
            };

            const response = org.jsoup.Jsoup.connect(RESERVATION_SERVER_URL + "/reservation/open")
                .requestBody(JSON.stringify(requestBody))
                .timeout(5000)
                .ignoreContentType(true)
                .post();

            const data = JSON.parse(response.text());

            const gameCount: number = data.session % 100;
            const reservation: Map<string, string> = data.reservation;
            return { gameCount, reservation };
        },
        endToday: () => {
            const now = new Date();
            const year = now.getFullYear().toString().slice(-2);
            const month = (now.getMonth() + 1).toString().padStart(2, "0");
            const day = now.getDate().toString().padStart(2, "0");
            const session = `${year}${month}${day}01`;

            const requestBody = {
                storeBranch: "itaewon",
                gameType,
                session,
            };

            const response = org.jsoup.Jsoup.connect(RESERVATION_SERVER_URL + "/reservation/open")
                .requestBody(JSON.stringify(requestBody))
                .timeout(5000)
                .ignoreContentType(true)
                .post();
            
            const data = JSON.parse(response.text());
            
            const gameCount: number = data.session % 100;
            const reservation: Map<string, string> = data.reservation;
            return { gameCount, reservation };
        },
    };
};

type Game = {
    gameType: GAME_TYPE,
    getGameInformation: (gameCount: number, reservation: Map<string, string>) => string,
    reserve: (nicknames: Set<string>, time: string) => {gameCount: number, reservation: Map<string, string>},
    cancelReservation: (nicknames: Set<string>) => {gameCount: number, reservation: Map<string, string>},
    startGame: () => void,
    openReservationNextGame: () => {gameCount: number, reservation: Map<string, string>},
    endToday: () => {gameCount: number, reservation: Map<string, string>},
}

const monsterGame = (): Game => {
    const monsterReservation = gameReservation(GAME_TYPE.MONSTER);

    const getGameInformation = (gameCount: number, reservation: Map<string, string>) => {
        return "✪ 𝗠 𝗢 𝗡 𝗦 𝗧 𝗘 𝗥 𝗚 𝗔 𝗠 𝗘 ✪\n\n" +
        "➜ MTT 토너먼트 (엔트리제한X)\n" +
        "➜ 300만칩 스타트 (150bb)\n" +
        "➜ 리바인 2회 (400만칩)\n" +
        "➜ 7엔트리당 시드 10만\n" +
        "➜ 획득시드 2만당 승점 +1점 / 바인 +1점\n\n" +
        "-" + gameCount + "부-\n" +
        "🅁 예약자 명단 (최소 6포이상)\n\n" +
        reservationListToString(reservation) + "\n\n" +
        "♠ 문의사항은 핑크왕관에게 1:1톡 부탁드립니다";
    };

    const reservationListToString = (reservation: Map<string, string>): string => {
        let result = "";
        for (const [nickname, time] of reservation) {
            result += '★ ' + nickname + " " + time + '\n';
        }

        if (reservation.size >= 10) {
            result += '★ \n★ \n';
        } else {
            const repeatCount = 10 - reservation.size;
            for (let i = 0; i < repeatCount; i++) {
                result += '★ \n';
            }
        }

        return result;
    };

    return {
        gameType: GAME_TYPE.MONSTER,
        getGameInformation,
        reserve: monsterReservation.reserve,
        cancelReservation: monsterReservation.cancelReservation,
        startGame: monsterReservation.startGame,
        openReservationNextGame: monsterReservation.openReservationNextGame,
        endToday: monsterReservation.endToday,
    }
};

const sitAndGoGame = (): Game => {
    const sitAndGoReservation = gameReservation(GAME_TYPE.SIT_AND_GO);

    const getGameInformation = (gameCount: number, reservation: Map<string, string>) => {
        return "🅂 🄸 🅃  &  🄶 🄾\n\n" +
        "➜ MTT 토너먼트 (엔트리제한X)\n" +
        "➜ 200만칩 스타트\n" +
        "➜ 리바인 2회 (300만칩)\n" +
        "➜ 3엔트리당 시드 1만\n" +
        "➜ 획득시드 2만당 승점 +1점\n\n" +
        "-" + gameCount + "부-\n" +
        "🅁 예약자 명단 (최소 5포이상)\n\n" +
        reservationListToString(reservation) + "\n\n" +
        "♠ 문의사항은 핑크왕관에게 1:1톡 부탁드립니다";
    }

    const reservationListToString = (reservation: Map<string, string>): string => {
        let result = "";

        for (const [nickname, time] of reservation) {
            result += '★ ' + nickname + " " + time + '\n';
        }

        if (reservation.size >= 10) {
            result += '★ \n★ \n';
        } else {
            const repeatCount = 10 - reservation.size;
            for (let i = 0; i < repeatCount; i++) {
                result += '★ \n';
            }
        }

        return result;
    };

    return {
        gameType: GAME_TYPE.SIT_AND_GO,
        getGameInformation,
        reserve: sitAndGoReservation.reserve,
        cancelReservation: sitAndGoReservation.cancelReservation,
        startGame: sitAndGoReservation.startGame,
        openReservationNextGame: sitAndGoReservation.openReservationNextGame,
        endToday: sitAndGoReservation.endToday,
    }
};

const weeklyTournamentGame = (): Game => {
    const weeklyTournamentReservation = gameReservation(GAME_TYPE.WEEKLY_TOURNAMENT);

    const getGameInformation = (gameCount: number, reservation: Map<string, string>) => {
        return "🅆 🄴 🄴 🄺 🄻 🅈  🅃 🄾 🅄 🅁 🄽 🄰 🄼 🄴 🄽 🅃\n\n" +
        "➜ MTT 토너먼트 (엔트리제한X)\n" +
        "➜ 500만칩 스타트\n" +
        "➜ 리바인 2회 (700만칩)\n" +
        "➜ 5엔트리당 시드 1만\n" +
        "➜ 획득시드 2만당 승점 +1점\n\n" +
        "-" + gameCount + "부-\n" +
        "🅁 예약자 명단 (최소 6포이상)\n\n" +
        reservationListToString(reservation) + "\n\n" +
        "♠ 문의사항은 핑크왕관에게 1:1톡 부탁드립니다";
    };

    const reservationListToString = (reservation: Map<string, string>): string => {
        let result = "";
        let reservationCount = 0;

        for (const [nickname, time] of reservation) {
            result += '★ ' + nickname + " " + time + '\n';
            if (++reservationCount % 10 === 0) {
                result += "🟰🟰🟰🟰🟰🟰🟰🟰🟰🟰🟰\n";
            }
        }

        if (reservation.size >= 20) {
            result += '★ \n★ \n';
        } else {
            const repeatCount = 20 - reservation.size;
            for (let i = 0; i < repeatCount; i++) {
                result += '★ \n';
                if (++reservationCount % 10 === 0) {
                    result += "🟰🟰🟰🟰🟰🟰🟰🟰🟰🟰🟰\n";
                }
            }
        }

        return result;
    };

    return {
        gameType: GAME_TYPE.WEEKLY_TOURNAMENT,
        getGameInformation,
        reserve: weeklyTournamentReservation.reserve,
        cancelReservation: weeklyTournamentReservation.cancelReservation,
        startGame: weeklyTournamentReservation.startGame,
        openReservationNextGame: weeklyTournamentReservation.openReservationNextGame,
        endToday: weeklyTournamentReservation.endToday,
    }
};

const COMMANDS =  {
    MONSTER: "!몬스터",
    MONSTER_SHORT: "!몬",
    SIT_AND_GO: "!싯앤고",
    SIT_AND_GO_SHORT: "!싯",
    WEEKLY_TOURNAMENT:  "!주간토너먼트",
    WEEKLY_TOURNAMENT_SHORT: "!주토",
    END_TODAY: "!이태원마감",
};

const QUESTION_COMMAND = "?이태원봇"

const ROOM_MASTER_COMMAND = {
    MANAGE_STAFF: "!직원"
};

const isBotRoom = (room: string): boolean => {
    const botRooms = ["파이널나인 이태원점", "이태원봇 테스트", "파이널나인 이태원점 봇관리방"];
    return botRooms.includes(room);
};

const isCommand = (command: string): boolean => {
    return Object.values(COMMANDS).includes(command);
};

const isRoomMasterCommand = (command: string): boolean => {
    return Object.values(ROOM_MASTER_COMMAND).includes(command);
};

const generateReservationValue = (value: string): {nicknames: Set<string>, time: string} => {
    const replaceValue = value.replace(/, /g, ",");

    const valueTokenizer = replaceValue.split(" ");

    const nicknames = new Set(valueTokenizer[0].split(","));
    const time = valueTokenizer[1] || "현장";

    return {nicknames, time};
};

const 

const isRoomMaster = (sender: string): boolean => {
    return sender === "파이널나인 이태원대장 영기" || sender === "박재형" || sender === "컴테";
}

const isNotRoomMaster = (sender: string): boolean => {
    return !isRoomMaster(sender);
}

const checkRoomMaster = (sender: string) => {
    if (isNotRoomMaster(sender)) {
        return "방장만 사용 가능한 명령어입니다.";
    }
}

const staffList = new Set<string>();

const isStaff = (sender: string): boolean => {
    return isRoomMaster(sender) || staffList.has(sender)
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if isBotRoom(room) {
        const msgTokenizer = msg.split(" ");
        try {
            if (isCommand(msgTokenizer[0])) {
                let game: Game | undefined;
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
                        if (msgTokenizer[1] === "예약") {
                            const {nicknames, time} = generateReservationValue(msg.slice(msgTokenizer[0].length + msgTokenizer[1].length + 2));
                            const {gameCount, reservation} = game.reserve(nicknames, time);
                            replier.reply(game.getGameInformation(gameCount, reservation));
                        } else if (msgTokenizer[1] === "예약취소") {
                            const {nicknames} = generateReservationValue(msg.slice(msgTokenizer[0].length + msgTokenizer[1].length + 2));
                            const {gameCount, reservation} = game.cancelReservation(nicknames);
                            replier.reply(game.getGameInformation(gameCount, reservation));
                        }
                    }
                } else {
                    replier.reply("금일 이태원점 마감하였습니다!\n오늘도 방문해주신 Fit밀리분들 감사합니다\n오늘 하루도 즐겁게 보내시고 저녁에 파나에서 만나요!");
                    monsterGame().endToday();
                    sitAndGoGame().endToday();
                    weeklyTournamentGame().endToday();
                }
            } else if (msgTokenizer[0] === QUESTION_COMMAND) {
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
                switch (msgTokenizer[0]) {
                    case ROOM_MASTER_COMMAND.MANAGE_STAFF:

                        break;
                }
            }
        } catch(error) {

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
