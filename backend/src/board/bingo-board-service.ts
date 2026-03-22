import {BingoBoard, IBingoBoard} from "./bingo-board-model";

export interface CreateBoardInput {
    name: string;
    items: string[];
    freeSpace?: string;
    category?: string;
    userId: string;
}

export interface UpdateBoardInput {
    name?: string;
    items?: string[];
    freeSpace?: string;
    category?: string;
}

export const getAllBingoBoards = async (): Promise<IBingoBoard[]> => {
    return await BingoBoard.find();
};

export const getBingoBoardById = async (id: string): Promise<IBingoBoard | null> => {
    return await BingoBoard.findById(id);
};

export const getBingoBoardsByUserId = async (userId: string): Promise<IBingoBoard[]> => {
    return await BingoBoard.find({userId});
};

export const createBingoBoard = async (input: CreateBoardInput): Promise<IBingoBoard> => {
    const board = new BingoBoard({
        name: input.name,
        items: input.items,
        freeSpace: input.freeSpace,
        category: input.category,
        userId: input.userId,
    });
    return await board.save();
};

export const updateBingoBoard = async (
    id: string,
    userId: string,
    input: UpdateBoardInput
): Promise<IBingoBoard | null> => {
    return await BingoBoard.findOneAndUpdate(
        {_id: id, userId},
        {$set: input},
        {new: true}
    );
};

export const deleteBingoBoard = async (id: string, userId: string): Promise<boolean> => {
    const result = await BingoBoard.deleteOne({_id: id, userId});
    return result.deletedCount > 0;
};

// export const getBingoBoardsByTheme = async (theme: string) => {
//     return await BingoBoard.find({ theme });
// };
