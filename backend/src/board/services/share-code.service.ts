import {BingoBoard} from '../board.model';
import {IBingoBoard, ShareCodeResult} from '../board.types';
import {createRandomShareCode} from '../utils/share-code.util';

const SHARE_CODE_EXPIRY_HOURS = 24;

function isShareCodeExpired(board: IBingoBoard): boolean {
    return !!board.shareCodeExpiresAt && new Date(board.shareCodeExpiresAt) < new Date();
}

export class ShareCodeService {
    async clearExpiredCode(board: IBingoBoard): Promise<void> {
        if (isShareCodeExpired(board)) {
            await BingoBoard.updateOne(
                {_id: board._id},
                {$unset: {shareCode: '', shareCodeExpiresAt: ''}}
            );
            board.shareCode = undefined;
            board.shareCodeExpiresAt = undefined;
        }
    }

    async generate(boardId: string, userId: string): Promise<ShareCodeResult | null> {
        const board = await BingoBoard.findOne({_id: boardId, userId});
        if (!board) {
            return null;
        }

        const code = createRandomShareCode();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + SHARE_CODE_EXPIRY_HOURS);

        board.shareCode = code;
        board.shareCodeExpiresAt = expiresAt;

        try {
            await board.save();
        } catch (err: any) {
            if (err.code === 11000) {
                const retryCode = createRandomShareCode();
                board.shareCode = retryCode;
                await board.save();
            } else {
                throw err;
            }
        }

        return {shareCode: board.shareCode!, expiresAt};
    }

    async disable(boardId: string, userId: string): Promise<boolean> {
        const board = await BingoBoard.findOneAndUpdate(
            {_id: boardId, userId},
            {$unset: {shareCode: '', shareCodeExpiresAt: ''}},
            {new: true}
        );
        return !!board;
    }

    async getByCode(code: string): Promise<IBingoBoard | null> {
        const board = await BingoBoard.findOne({shareCode: code});

        if (!board) {
            return null;
        }

        if (isShareCodeExpired(board)) {
            await this.clearExpiredCode(board);
            return null;
        }

        return board;
    }
}