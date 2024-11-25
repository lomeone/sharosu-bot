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

const monsterGame = () => {
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

const sitAndGoGame = () => {
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

const weeklyTournamentGame = () => {
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
};
