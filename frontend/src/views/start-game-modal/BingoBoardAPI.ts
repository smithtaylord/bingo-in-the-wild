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

export interface CreateBoardInput {
    name: string;
    items: string[];
    freeSpace?: string;
    category?: string;
}

export interface UpdateBoardInput {
    name?: string;
    items?: string[];
    freeSpace?: string | null;
    category?: string;
}

export const SPORTS_CATEGORY = 'Sports';
export const SOCIAL_CATEGORY = 'Social';
export const LOCATION_CATEGORY = 'Location';

export class BingoBoardAPI {
    private async getAuthHeaders(): Promise<HeadersInit> {
        const token = await import('@/services/auth').then(m => m.getAccessToken());
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    }

    async getBingoBoards(): Promise<BingoBoard[]> {
        try {
            const response = await fetch('api/bingo-board');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching boards:', error);
            throw error;
        }
    }

    async getBingoBoardById(id: string): Promise<BingoBoard> {
        const response = await fetch(`api/bingo-board/${id}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async getBingoBoardsByUser(userId: string): Promise<BingoBoard[]> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`api/bingo-board/user/${userId}`, {headers});

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async createBingoBoard(input: CreateBoardInput): Promise<BingoBoard> {
        const headers = await this.getAuthHeaders();
        const response = await fetch('api/bingo-board', {
            method: 'POST',
            headers,
            body: JSON.stringify(input),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create board');
        }

        return await response.json();
    }

    async updateBingoBoard(id: string, input: UpdateBoardInput): Promise<BingoBoard> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`api/bingo-board/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(input),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update board');
        }

        return await response.json();
    }

    async deleteBingoBoard(id: string): Promise<void> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`api/bingo-board/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete board');
        }
    }
}