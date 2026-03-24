import mongoose, {Schema} from 'mongoose';
import {IBingoBoard} from './board.types';

const BingoBoardSchema: Schema = new Schema(
    {
        name: {type: String, required: true},
        freeSpace: {type: String},
        items: {type: [String], required: true},
        category: {type: String},
        userId: {type: String},
        shareCode: {
            type: String,
            sparse: true,
            index: true
        },
        shareCodeExpiresAt: {type: Date},
    },
    {
        timestamps: {createdAt: 'createdOn', updatedAt: 'updatedOn'}
    }
);

export const BingoBoard = mongoose.model<IBingoBoard>('BingoBoard', BingoBoardSchema);
