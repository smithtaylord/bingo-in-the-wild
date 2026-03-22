import {BingoBoard, IBingoBoard} from "./bingo-board-model";

export const getAllBingoBoards = async (): Promise<IBingoBoard[]> => {
    return await BingoBoard.find();
};

export const getBingoBoardById = async (id: string): Promise<IBingoBoard | null> => {
    return await BingoBoard.findById(id);
};

// export const getBingoBoardsByTheme = async (theme: string) => {
//     return await BingoBoard.find({ theme });
// };
