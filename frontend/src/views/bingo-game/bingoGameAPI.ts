// import {shuffle} from "@/views/common/functions/shuffle";
// import {BingoCell} from "@/views/bingo-game/bingoGameService";
//
export class BingoGameAPI {
//     getThemeName(id: number){
//         return MOCK_GAME_THEMES.find(theme => theme.id == id)?.name;
//     }
//    
//     createGameBoard(id: number): BingoCell[][] | null{
//         const theme: GameTheme | undefined = MOCK_GAME_THEMES.find(theme => theme.id == id)
//         if(!theme){
//             return null;
//         }
//         const shuffledLabels: string[] = shuffle(theme?.labels).slice(0,24)
//
//         let board: BingoCell[][] = [];
//         let labelIndex = 0;
//
//         for (let row = 0; row < 5; row++) {
//             const boardRow: BingoCell[] = [];
//             for (let col = 0; col < 5; col++) {
//                 if (row === 2 && col === 2) {
//                     // center free space
//                     boardRow.push({ label: theme.freeSpaceLabel ?? "Free", isMarked: true, isFreeSpace: true }); 
//                 } else {
//                     boardRow.push({ label: shuffledLabels[labelIndex], isMarked: false });
//                     labelIndex++;
//                 }
//             }
//             board.push(boardRow);
//         }
//        
//         return board;
//        
//     }
}