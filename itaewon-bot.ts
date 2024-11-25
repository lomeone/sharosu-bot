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
