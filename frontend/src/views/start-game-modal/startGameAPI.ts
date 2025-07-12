import {GameTheme, MOCK_GAME_THEMES} from "@/views/mock-game-themes/mockGameThemes";

export class ThemeSelectorAPI {
    getThemes(): GameTheme[] {
        return MOCK_GAME_THEMES
    }
}