import {BingoBoard, IBingoBoard} from "./bingo-board-model";

const SHARE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SHARE_CODE_LENGTH = 6;
const SHARE_CODE_EXPIRY_HOURS = 24;
const MAX_GENERATION_ATTEMPTS = 5;

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

function createRandomShareCode(): string {
    let code = '';
    for (let i = 0; i < SHARE_CODE_LENGTH; i++) {
        code += SHARE_CODE_CHARS[Math.floor(Math.random() * SHARE_CODE_CHARS.length)];
    }
    return code;
}

async function isShareCodeUnique(code: string): Promise<boolean> {
    const existing = await BingoBoard.findOne({shareCode: code});
    return !existing;
}

async function createUniqueShareCode(): Promise<string> {
    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
        const code = createRandomShareCode();
        if (await isShareCodeUnique(code)) {
            return code;
        }
    }
    throw new Error('Unable to generate unique share code');
}

export const getAllBingoBoards = async (): Promise<IBingoBoard[]> => {
    return await BingoBoard.find({category: {$exists: true, $ne: null}});
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

export const generateShareCode = async (
    boardId: string,
    userId: string
): Promise<{shareCode: string; expiresAt: Date} | null> => {
    const board = await BingoBoard.findOne({_id: boardId, userId});
    if (!board) {
        return null;
    }

    const code = await createUniqueShareCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + SHARE_CODE_EXPIRY_HOURS);

    board.shareCode = code;
    board.shareCodeExpiresAt = expiresAt;
    await board.save();

    return {shareCode: code, expiresAt};
};

export const disableShareCode = async (
    boardId: string,
    userId: string
): Promise<boolean> => {
    const board = await BingoBoard.findOneAndUpdate(
        {_id: boardId, userId},
        {$unset: {shareCode: '', shareCodeExpiresAt: ''}},
        {new: true}
    );
    return !!board;
};

export const getBoardByShareCode = async (code: string): Promise<IBingoBoard | null> => {
    const board = await BingoBoard.findOne({shareCode: code});
    if (!board) {
        return null;
    }

    if (board.shareCodeExpiresAt && new Date() > board.shareCodeExpiresAt) {
        return null;
    }

    return board;
};

export const copyBoard = async (
    boardId: string,
    userId: string
): Promise<IBingoBoard | null> => {
    const originalBoard = await BingoBoard.findById(boardId);
    if (!originalBoard) {
        return null;
    }

    const newBoard = new BingoBoard({
        name: `${originalBoard.name} (Copy)`,
        items: [...originalBoard.items],
        freeSpace: originalBoard.freeSpace,
        category: originalBoard.category,
        userId: userId,
    });
    return await newBoard.save();
};

// export const getBingoBoardsByTheme = async (theme: string) => {
//     return await BingoBoard.find({ theme });
// };
