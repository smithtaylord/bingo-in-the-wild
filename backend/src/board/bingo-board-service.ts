import {BingoBoard, IBingoBoard} from "./bingo-board-model";

export const getAllBingoBoards = async (): Promise<IBingoBoard[]> => {
    return await BingoBoard.find();
};

// export const getBingoBoardsByTheme = async (theme: string) => {
//     return await BingoBoard.find({ theme });
// };
