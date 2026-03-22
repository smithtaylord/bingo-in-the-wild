# TODO.md - Bingo in the Wild

## Phase 1: Audit Fixes (Stabilize Current App)

### Backend Fixes
- [x] Fix typo: rename `bingo-board-contoller.ts` → `bingo-board-controller.ts`
- [x] Add `.env.example` files for both frontend and backend
- [x] Remove token logging from `auth.ts:62` (security issue)
- [x] Remove stack trace from error response in `user-controller.ts:24`
- [x] Add TypeScript types for `req.auth` payload

### Frontend Fixes
- [x] Fix CORS origin to be configurable via env variable
- [x] Add loading state while Auth0 initializes (prevent UI flash)

### Core Game Fix (Critical)
- [x] **Implement `BingoGameAPI.createGameBoard()`** - connect to backend data
- [x] **Implement `BingoGameAPI.getThemeName()`** - fetch from board API
- [x] Wire up `StartGameModal` to pass selected board ID to `BingoPage`
- [x] Fix navigation on board selection (was commented out in HomePage.vue)
- [x] Test end-to-end: select board → play → win

---

## Phase 2: Core Feature Completion

### Board Creation
- [x] **Backend:** Add `POST /api/bingo-board` endpoint with auth middleware
- [x] **Backend:** Add `PUT /api/bingo-board/:id` endpoint (owner only)
- [x] **Backend:** Add `DELETE /api/bingo-board/:id` endpoint (owner only)
- [x] **Backend:** Add `GET /api/bingo-board/user/:userId` for user's boards
- [x] **Frontend:** Implement `saveTheme()` in `AddEditNewBoardModal.vue`
- [x] **Frontend:** Add validation (minimum 24 items)
- [x] **Frontend:** Add edit existing board functionality

### Board Management UX Improvements
- [x] Fix modal mode logic (separate editBoardId from sourceBoardId)
- [x] Update "My Games" with swipe actions (Edit/Delete)
- [x] Add delete confirmation dialog
- [x] Update template copy to show "(Copy)" suffix on name
- [x] Pass editBoardId prop to AddEditNewBoardModal

### Route Protection (Optional)
- [ ] Add `meta.requiresAuth` to protected routes in `router/index.ts`
- [ ] Implement `router.beforeEach` navigation guard
- [ ] Test protected routes redirect properly

**Note:** State management (Pinia) is not needed for single-player mode. It would only be beneficial for Phase 3 multiplayer when WebSocket state synchronization becomes necessary.

---

## Phase 3: New Features

### Feature 1: Game Sharing via Code (Jackbox-style)

**Game Flow:**
- Host creates a game session with a selected board
- System generates a 6-character join code
- Other players join using the code (no login required)
- Each player receives the same item pool but randomized boards
- First player to get BINGO claims their win
- Host confirms or rejects the claimed win
- Winner is announced to all players

**Data Model Changes:**
- [ ] Create `GameSession` model (backend)
  ```typescript
  {
    code: string; // 6-character join code
    hostId: string; // Auth0 user ID
    boardId: string; // Reference to BingoBoard
    items: string[]; // Copied from board at game start
    players: { id, name, claimedBingo: boolean, winningCells?: number[][] }[];
    status: 'waiting' | 'playing' | 'finished';
    winnerId?: string;
    createdAt: Date;
  }
  ```

**Backend Endpoints:**
- [ ] `POST /api/game-session` - Create session (generates code)
- [ ] `GET /api/game-session/:code` - Join/validate code
- [ ] `POST /api/game-session/:code/join` - Add player to session
- [ ] `POST /api/game-session/:code/win` - Claim bingo win
- [ ] `POST /api/game-session/:code/confirm-win` - Confirm/reject win (host only)

**Frontend:**
- [ ] Create `LobbyPage.vue` - Waiting room before game starts
- [ ] Implement `joinGame()` in `HomePage.vue`
- [ ] Create `GameCodeDisplay.vue` - Show join code to host
- [ ] Add "Start Multiplayer Game" option to `StartGameModal.vue`
- [ ] Randomize board per player using same item pool
- [ ] Create `WinClaimModal.vue` - Host confirms/rejects claimed wins

**WebSocket Events:**
- [ ] `player-joined` - Broadcast when new player joins
- [ ] `game-started` - All players receive their randomized board
- [ ] `bingo-claimed` - Winner broadcasts their win with winning cells
- [ ] `win-confirmed` - Host confirms, game ends

---

### Feature 2: Light/Dark Mode Theme System

**Design:**
- Default: Existing minty green and coral theme (unchanged)
- Light Mode: White background, dark text, preserve existing colors
- Dark Mode: Dark background (dark-green tones), light text, preserve existing accent colors

**CSS Variables:**
- [ ] Review existing `theme/variables.css` and identify variables to override
- [ ] Add CSS variables for theme colors
- [ ] Implement dark mode using CSS class toggle

**State Management:**
- [ ] Add `theme` preference to localStorage
- [ ] Default: 'system' (follows OS preference)
- [ ] Options: 'system' | 'light' | 'dark' | 'default'

**Components:**
- [ ] Add theme toggle to `Menu.vue`
- [ ] Create `ThemeToggle.vue` component
- [ ] Apply `class="dark"` to `<ion-app>` when dark mode active

---

### Feature 3: WebSocket Integration

**Library:** Socket.IO

**Backend:**
- [ ] Install `socket.io`
- [ ] Create `socket/index.ts` with room management per game session
- [ ] Integrate with Express server
- [ ] Add authentication middleware for socket connections (optional for players)

**Frontend:**
- [ ] Install `socket.io-client`
- [ ] Create `useSocket.ts` composable
- [ ] Connect on game session join
- [ ] Emit/listen for game events

**Events Design:**
```
Client → Server:
  - join-game(code, playerName)
  - leave-game()
  - start-game()  // Host only
  - claim-bingo(winningCells)
  - confirm-win(playerId)  // Host only

Server → Client:
  - player-joined(name, playerCount)
  - player-left(name, playerCount)
  - game-started(boardData, items)
  - bingo-claimed(winnerName, winningCells)
  - win-confirmed(winnerName)
  - game-ended(status)
```

---

## Phase 4: Polish & Production Readiness

### Error Handling
- [ ] Add global error boundary in Vue
- [ ] Add toast notifications for API failures
- [ ] Add retry logic for failed API calls

### UX Improvements
- [ ] Add loading spinners during API calls
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add "Leave Game" confirmation

### Code Quality
- [ ] Extract `BingoPage.vue` logic into `useBingoGame.ts` composable
- [ ] Create `useToast.ts` utility for Ionic toasts
- [ ] Add consistent error handling pattern across components

### Production
- [ ] Configure CORS for production domain
- [ ] Add rate limiting to API endpoints
- [ ] Add input validation (express-validator)
- [ ] Set up proper logging (Winston/Pino)

---

## Model Usage Recommendations

| Phase | Recommended Model | Reasoning |
|-------|-------------------|-----------|
| Phase 1 (Fixes) | Coding model | Small fixes, no architecture decisions |
| Phase 2 (Core) | Coding model | CRUD endpoints - straightforward |
| Phase 3.1 (Sharing) | Planning → Coding | Need design decisions first |
| Phase 3.2 (Themes) | Coding model | Straightforward CSS |
| Phase 3.3 (WebSockets) | Planning → Coding | Architecture decisions critical |
| Phase 4 (Polish) | Coding model | Incremental improvements |

---

## Dependencies

```
Phase 1 Core Game Fix → Phase 2 Board CRUD (needs working boards)
Phase 3.1 Game Sessions → Phase 3.3 WebSockets
Phase 3.2 Themes → Independent (can parallelize)
```

**Note:** Route Protection is optional - auth works without it, it's just for better UX.
