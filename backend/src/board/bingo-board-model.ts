import mongoose, {Document, Schema} from 'mongoose';

export interface IBingoBoard extends Document {
    name: string;
    freeSpace?: string;
    items: string[];
    category?: string; // e.g. "Sports", "Social", etc.
    userId?: string;
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
    },
    {
        timestamps: {createdAt: 'createdOn', updatedAt: 'updatedOn'}
    }
);

export const BingoBoard = mongoose.model<IBingoBoard>('BingoBoard', BingoBoardSchema);
