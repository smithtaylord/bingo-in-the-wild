export interface BingoBoard {
    _id: string;
    name: string;
    freeSpace?: string;
    items: string[];
    category?: string;
    userId?: string;
    shareCode?: string;
    shareCodeExpiresAt?: string;
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

export interface ShareCodeResult {
    shareCode: string;
    expiresAt: string;
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
            const response = await fetch('api/board');

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
        const response = await fetch(`api/board/${id}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async getBingoBoardsByUser(userId: string): Promise<BingoBoard[]> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`api/board/user/${userId}`, {headers});

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async createBingoBoard(input: CreateBoardInput): Promise<BingoBoard> {
        const headers = await this.getAuthHeaders();
        const response = await fetch('api/board', {
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
        const response = await fetch(`api/board/${id}`, {
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
        const response = await fetch(`api/board/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete board');
        }
    }

    async getBoardByShareCode(code: string): Promise<BingoBoard> {
        const response = await fetch(`api/board/code/${code}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Board not found or code has expired');
        }

        return await response.json();
    }

    async generateShareCode(boardId: string): Promise<ShareCodeResult> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`api/board/${boardId}/share`, {
            method: 'POST',
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to generate share code');
        }

        return await response.json();
    }

    async disableShareCode(boardId: string): Promise<void> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`api/board/${boardId}/share`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to disable share code');
        }
    }

    async copyBoard(boardId: string): Promise<BingoBoard> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`api/board/${boardId}/copy`, {
            method: 'POST',
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to copy board');
        }

        return await response.json();
    }
}