// const scriptName = "test";

// /**
//  * (string) room
//  * (string) sender
//  * (boolean) isGroupChat
//  * (void) replier.reply(message)
//  * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
//  * (string) imageDB.getProfileBase64()
//  * (string) packageName
//  */

// enum GAME_STATUS {
//   RESERVATION,
//   START,
// };

// interface GameReservation {
//   gameCount: number;
//   gameStatus: GAME_STATUS
//   reservationList: string[];
//   getGameInformation(): string;
//   startGame(): void;
//   reserveNextGame(): void
//   endToday(): void
// };

// class Monster implements GameReservation {
//   gameCount: number = 1;
//   reservationList: string[] = [];
//   gameStatus: GAME_STATUS = GAME_STATUS.RESERVATION;

//   reservationListToString(): string {
//     return this.reservationList.map(item => `◾️ ${item}\n`).join("")
//       + (this.reservationList.length >= 10
//           ? "◾ \n◾ \n"
//           : `${"◾️ \n".repeat(10 - this.reservationList.length)}`);
//   }

//   getGameInformation(): string {
//     return "🏴‍☠️Final Nine 4ㅑ로수길 🏴‍☠️\n" +
//               "🎲Monster stack game\n\n" +
//               "▪️" + this.gameCount + "부▪️\n\n" +
//               "⬛️◼️◾️▪️▪️◾️◼️⬛️\n" +
//               "▪️7엔트리당 시드 10만\n" +
//               "◾️300만칩 시작 (150BB)\n" +
//               "▪️리바인 2회 (400만칩)\n" +
//               "◾️획득시드 2만당 몬스터 승점 1점\n" +
//               "▪️바인,리바인시 몬스터 승점 1점\n" +
//               "⬛️◼️◾️▪️▪️◾️◼️⬛️\n\n" +
//               "‼️1부 한정 얼리칩 +40‼️\n\n" +
//               "❕예약자 명단 (최소 6포 이상/12포 밸런싱 )\n" +
//               "📢빠르고 원활한 게임진행을 위해\n" +
//               "예약시 방문예정 시간대를 함께 기재 부탁드립니다\n\n" +
//               this.reservationListToString() + "\n\n" +
//               "⬛️ 문의사항은 핑크왕관에게 1:1톡 주세요";
//   };

//   startGame(): void {
//     this.gameStatus = GAME_STATUS.START
//   }
//   reserveNextGame(): void {
//     this.gameCount++;
//     this.reservationList = [];
    
//   }
//   endToday(): void {
//     this.gameCount = 1;
//     this.reservationList = []
//   }
// }



// const monster = new Monster();

// function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
//   replier.reply(monster.getGameInformation)
//   const msgTokenizer = msg.split(" ");
// }

// //아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
// function onCreate(savedInstanceState, activity) {
//   var textView = new android.widget.TextView(activity);
//   textView.setText("Hello, World!");
//   textView.setTextColor(android.graphics.Color.DKGRAY);
//   activity.setContentView(textView);
// }

// function onStart(activity) {}

// function onResume(activity) {}

// function onPause(activity) {}

// function onStop(activity) {}