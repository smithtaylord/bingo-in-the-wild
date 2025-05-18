export interface BingoCell{
    label: string;
    isMarked?: boolean;
    isFreeSpace?: boolean;
}

const BINGO_WINNER_POSSIBILITIES = [
    // Horizontal Winners
    [[0,0], [0,1], [0,2], [0,3], [0,4]],
    [[1,0], [1,1], [1,2], [1,3], [1,4]],
    [[2,0], [2,1], [2,2], [2,3], [2,4]],
    [[3,0], [3,1], [3,2], [3,3], [3,4]],
    [[4,0], [4,1], [4,2], [4,3], [4,4]],
    // Vertical Winners
    [[0,0], [1,0], [2,0], [3,0], [4,0]],
    [[0,1], [1,1], [2,1], [3,1], [4,1]],
    [[0,2], [1,2], [2,2], [3,2], [4,2]],
    [[0,3], [1,3], [2,3], [3,3], [4,3]],
    [[0,4], [1,4], [2,4], [3,4], [4,4]],
    // Diagonal Winners
    [[0,0], [1,1], [2,2], [3,3], [4,4]],
    [[0,4], [1,3], [2,2], [3,1], [4,0]],
]

export function checkWinner(bingoCard: BingoCell[][]): boolean {
    return BINGO_WINNER_POSSIBILITIES.some(possibility =>
        possibility.every(([x, y]) => bingoCard[x][y].isMarked)
    );
}

export function clearBoard(bingoCard: BingoCell[][]): BingoCell[][] {
    for (const row of bingoCard) {
        for (const cell of row) {
            if(!cell.isFreeSpace)
                cell.isMarked = false;
        }
    }
    return bingoCard;
}