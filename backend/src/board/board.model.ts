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

BingoBoardSchema.index({userId: 1});
BingoBoardSchema.index({category: 1});
BingoBoardSchema.index({_id: 1, userId: 1});

export const BingoBoard = mongoose.model<IBingoBoard>('BingoBoard', BingoBoardSchema);
