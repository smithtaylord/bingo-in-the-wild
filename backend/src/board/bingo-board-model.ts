import mongoose, {Document, Schema} from 'mongoose';

export interface IBingoBoard extends Document {
    name: string;
    freeSpace?: string;
    items: string[];
    category?: string; // e.g. "Sports", "Social", etc.
    userId?: string;
    shareCode?: string; // 6-char share code
    shareCodeExpiresAt?: Date; // Expiration timestamp
    createdOn: Date;
    updatedOn: Date;
}

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
