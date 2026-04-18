import {Document} from 'mongoose';

export interface IBingoBoard extends Document {
    name: string;
    freeSpace?: string;
    items: string[];
    category?: string;
    userId?: string;
    shareCode?: string;
    shareCodeExpiresAt?: Date;
    createdOn: Date;
    updatedOn: Date;
}

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

export interface ShareCodeResult {
    shareCode: string;
    expiresAt: Date;
}
