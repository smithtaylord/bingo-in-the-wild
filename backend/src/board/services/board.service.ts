import {BingoBoard} from '../board.model';
import {CreateBoardInput, IBingoBoard, UpdateBoardInput} from '../board.types';
import {ShareCodeService} from './share-code.service';

export class BoardService {
    private shareCodeService = new ShareCodeService();

    async getAll(page = 1, limit = 20): Promise<{boards: IBingoBoard[], total: number, page: number, totalPages: number}> {
        const skip = (page - 1) * limit;
        const filter = {category: {$exists: true, $ne: null}};
        const [boards, total] = await Promise.all([
            BingoBoard.find(filter).select('-items').skip(skip).limit(limit),
            BingoBoard.countDocuments(filter),
        ]);

        await Promise.all(boards.filter(b => b.shareCode).map(b => this.shareCodeService.clearExpiredCode(b)));

        return {
            boards,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getById(id: string): Promise<IBingoBoard | null> {
        const board = await BingoBoard.findById(id);
        if (board?.shareCode) {
            await this.shareCodeService.clearExpiredCode(board);
        }
        return board;
    }

    async getByUserId(userId: string, page = 1, limit = 20): Promise<{boards: IBingoBoard[], total: number, page: number, totalPages: number}> {
        const skip = (page - 1) * limit;
        const filter = {userId};
        const [boards, total] = await Promise.all([
            BingoBoard.find(filter).skip(skip).limit(limit),
            BingoBoard.countDocuments(filter),
        ]);

        await Promise.all(boards.filter(b => b.shareCode).map(b => this.shareCodeService.clearExpiredCode(b)));

        return {
            boards,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
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
