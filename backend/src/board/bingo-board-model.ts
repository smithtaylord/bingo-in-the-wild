import mongoose, {Document, Schema} from 'mongoose';

export interface IBingoBoard extends Document {
    name: string;
    freeSpaceLabel?: string;
    labels: string[];
    theme?: string; // e.g. "Sports", "Social", etc.
    userId?: string;
    createdAt: Date;
}

const BingoBoardSchema: Schema = new Schema(
    {
        name: {type: String, required: true},
        freeSpaceLabel: {type: String},
        labels: {type: [String], required: true},
        theme: {type: String},
        userId: {type: String},
    },
    {
        timestamps: {createdAt: 'createdAt', updatedAt: false},
    }
);

export const BingoBoard = mongoose.model<IBingoBoard>('BingoBoard', BingoBoardSchema);
