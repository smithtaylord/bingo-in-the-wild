import {BingoBoard} from '../board.model';
import {IBingoBoard, ShareCodeResult} from '../board.types';
import {createUniqueShareCode} from '../utils/share-code.util';

const SHARE_CODE_EXPIRY_HOURS = 24;

export class ShareCodeService {
    async generate(boardId: string, userId: string): Promise<ShareCodeResult | null> {
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

        if (board.shareCodeExpiresAt && new Date() > board.shareCodeExpiresAt) {
            return null;
        }

        return board;
    }
}
