export interface BingoBoard {
    _id: string;
    name: string;
    freeSpace?: string;
    items: string[];
    category?: string;
    userId?: string;
    createdOn: string;
    updatedOn: string;
}

export const SPORTS_CATEGORY = 'Sports';
export const SOCIAL_CATEGORY = 'Social';
export const LOCATION_CATEGORY = 'Location';

export class BingoBoardAPI {
    async getBingoBoards(): Promise<BingoBoard[]> {
        console.log('[hey]')
        try {
            const response = await fetch('api/bingo-board');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
}