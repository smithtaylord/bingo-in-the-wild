import {BingoCell} from "@/views/bingo-game/bingoGameService";
import {BingoBoard} from "@/views/start-game-modal/BingoBoardAPI";
import {shuffle} from "@/views/common/functions/shuffle";

export class BingoGameAPI {
    async loadBoard(id: string): Promise<BingoBoard | null> {
        try {
            const response = await fetch(`api/board/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching board:', error);
            return null;
        }
    }

    getThemeName(board: BingoBoard | null): string | undefined {
        return board?.name;
    }

    async createGameBoard(id: string): Promise<BingoCell[][] | null> {
        const board = await this.loadBoard(id);
        if (!board) {
            return null;
        }

        if (!board.items || board.items.length < 24) {
            console.error('Board does not have enough items (need at least 24)');
            return null;
        }

        const shuffledLabels: string[] = shuffle(board.items).slice(0, 24);
        const gameBoard: BingoCell[][] = [];
        let labelIndex = 0;

        for (let row = 0; row < 5; row++) {
            const boardRow: BingoCell[] = [];
            for (let col = 0; col < 5; col++) {
                if (row === 2 && col === 2) {
                    boardRow.push({
                        label: board.freeSpace || "Free",
                        isMarked: true,
                        isFreeSpace: true
                    });
                } else {
                    boardRow.push({label: shuffledLabels[labelIndex], isMarked: false});
                    labelIndex++;
                }
            }
            gameBoard.push(boardRow);
        }

        return gameBoard;
    }
}
