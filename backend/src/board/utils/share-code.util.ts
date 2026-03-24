import {BingoBoard} from '../board.model';

const SHARE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SHARE_CODE_LENGTH = 6;
const MAX_GENERATION_ATTEMPTS = 5;

export function createRandomShareCode(): string {
    let code = '';
    for (let i = 0; i < SHARE_CODE_LENGTH; i++) {
        code += SHARE_CODE_CHARS[Math.floor(Math.random() * SHARE_CODE_CHARS.length)];
    }
    return code;
}

export async function isShareCodeUnique(code: string): Promise<boolean> {
    const existing = await BingoBoard.findOne({shareCode: code});
    return !existing;
}

export async function createUniqueShareCode(): Promise<string> {
    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
        const code = createRandomShareCode();
        if (await isShareCodeUnique(code)) {
            return code;
        }
    }
    throw new Error('Unable to generate unique share code');
}
