import {BingoBoard} from '../board.model';
import {CreateBoardInput, IBingoBoard, UpdateBoardInput} from '../board.types';

export class BoardService {
    async getAll(): Promise<IBingoBoard[]> {
        return await BingoBoard.find({category: {$exists: true, $ne: null}});
    }

    async getById(id: string): Promise<IBingoBoard | null> {
        return await BingoBoard.findById(id);
    }

    async getByUserId(userId: string): Promise<IBingoBoard[]> {
        return await BingoBoard.find({userId});
    }

    async create(input: CreateBoardInput): Promise<IBingoBoard> {
        const board = new BingoBoard({
            name: input.name,
            items: input.items,
            freeSpace: input.freeSpace,
            category: input.category,
            userId: input.userId,
        });
        return await board.save();
    }

    async update(
        id: string,
        userId: string,
        input: UpdateBoardInput
    ): Promise<IBingoBoard | null> {
        return await BingoBoard.findOneAndUpdate(
            {_id: id, userId},
            {$set: input},
            {new: true}
        );
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const result = await BingoBoard.deleteOne({_id: id, userId});
        return result.deletedCount > 0;
    }

    async copy(boardId: string, userId: string): Promise<IBingoBoard | null> {
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
    }
}
