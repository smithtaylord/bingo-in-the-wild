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

### Guest Play Mode
- [x] Show "Start a New Game" button for non-logged-in users
- [x] Gray out "My Games" tab for guests with informative message
- [x] Default to "Sports" tab for guests
- [x] Add login prompt in "My Games" message with "Log In" button
- [x] Update login hint text to clarify play doesn't require login

### Bulk Add Feature
- [x] Add single/bulk toggle to AddEditNewBoardModal
- [x] Add textarea for bulk item input
- [x] Parse comma AND newline separated items
- [x] Filter duplicates during parse (case-insensitive)
- [x] Show count of items added
- [x] Clear textarea after successful add

### Toast Notifications
- [x] Create `services/toast.ts` utility for consistent toast styling
- [x] Replace inline messages with toast notifications
- [x] Success toasts use `dark-green` color (dark background, light text)
- [x] Error toasts use `danger` color
- [x] Warning toasts use `warning` color

---

## Phase 3: Shareable Boards MVP

### Overview
Board owners can share their themes with others via a 6-character code. Players can join using the code without logging in. Logged-in players can optionally save shared themes to their own collection.

### Backend Changes

#### BingoBoard Model Updates
**File:** `backend/src/board/bingo-board-model.ts`
- [x] Add `shareCode: String` (6-char, sparse unique index)
- [x] Add `shareCodeExpiresAt: Date` (expiration timestamp)
- [x] Add unique sparse index on `shareCode` field

#### Share Code Generation Logic
**File:** `backend/src/board/bingo-board-service.ts`
- [x] Implement `generateShareCode()` function
  - Characters: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no I, O, 0, 1)
  - Retry logic on collision (3-5 attempts)
- [x] Implement `generateUniqueCode()` with collision handling

#### Backend Service Methods
**File:** `backend/src/board/bingo-board-service.ts`
- [x] `generateShareCode(boardId, userId)` - Generate 6-char code, set 24hr expiry
- [x] `disableShareCode(boardId, userId)` - Clear code and expiry
- [x] `getBoardByShareCode(code)` - Find board, check expiry, throw 404 if invalid/expired
- [x] `copyBoard(boardId, userId)` - Create independent copy with "(Copy)" suffix

#### Backend Endpoints
**File:** `backend/src/board/bingo-board-controller.ts`
- [x] `POST /api/bingo-board/:id/share` - Generate/regenerate share code (owner only)
- [x] `DELETE /api/bingo-board/:id/share` - Disable sharing, clear code (owner only)
- [x] `GET /api/bingo-board/code/:code` - Get board by share code (public, no auth)
- [x] `POST /api/bingo-board/:id/copy` - Copy board to user's collection (auth required)

---

### Frontend Changes

#### BingoBoardAPI Updates
**File:** `frontend/src/views/start-game-modal/BingoBoardAPI.ts`
- [x] `generateShareCode(boardId)` - Returns `{ shareCode, expiresAt }`
- [x] `disableShareCode(boardId)` - Clears share code
- [x] `getBoardByShareCode(code)` - Gets board data for code
- [x] `copyBoard(boardId)` - Creates copy for current user

#### HomePage Updates
**File:** `frontend/src/views/home/HomePage.vue`
- [x] Add "Join a Game" button (visible to all users)
- [x] Toggle to show inline OTP input + buttons
- [x] Cancel button (left) + Join button (right)
- [x] Join button validates via API
- [x] Show error toast for invalid/expired codes
- [x] On success, navigate to `/bingo-game/:boardId?code=ABC123`

#### New: ShareCodeModal
**File:** `frontend/src/views/start-game-modal/ShareCodeModal.vue` (NEW)
- [x] Display share code in large, copyable text
- [x] "Copy Code" button
- [x] Show expiration time countdown (e.g., "Expires in 23h 45m")
- [x] "Regenerate Code" button (size="small", generates new code)
- [x] "Disable Sharing" button (clears code, side-by-side with Regenerate)
- [x] "Go to Game Board" button - navigates to game
- [x] Fix regenerate - updates local state after API call

#### StartGameModal Updates
**File:** `frontend/src/views/start-game-modal/StartGameModal.vue`
- [x] For owned boards: Tap opens BoardDetailModal instead of starting game
- [x] Remove swipe actions (now in BoardDetailModal)
- [x] Public boards (Sports/Social/Location): Keep 1-tap to play

#### New: BoardDetailModal
**File:** `frontend/src/views/start-game-modal/BoardDetailModal.vue` (NEW)
- [x] Display board name
- [x] "Play Game" button - starts game
- [x] "Share Theme" button - generates code if needed, opens ShareCodeModal
- [x] "Edit Board" button - opens AddEditNewBoardModal
- [x] "Delete Board" button - confirmation + delete

#### BingoPage Updates
**File:** `frontend/src/views/bingo-game/BingoPage.vue`
- [x] Read `code` and `boardId` from route query params
- [x] Store share info in component state
- [x] Share code display below theme name (dark-green pill)
- [x] "Details" button opens ShareCodeModal
- [x] Only show share code if board has a share code

**ShareCodeModal Updates**
- [x] "Go to Game Board" button uses play icon
- [x] `isOwner` prop controls Regenerate/Disable visibility
- [x] Guests see only Copy Code and Go to Game Board

**Fast Modal Dismissal**
- [x] Use `onWillDismiss` for faster response
- [x] All modals dismiss immediately, then navigate

#### Route Handling
```
/bingo-game/:boardId              → Standard game (owner view)
/bingo-game/:boardId?code=ABC123  → Game joined via share code
```

---

### Implementation Order
- [x] Backend: Model Update - Add shareCode fields to schema
- [x] Backend: Service Layer - Implement share code logic with retry
- [x] Backend: Controller/Endpoints - Add 4 new routes
- [x] Frontend: API Client - Add new methods to BingoBoardAPI
- [x] Frontend: HomePage - Add "Join with Code" button
- [x] Frontend: JoinWithCodeModal - New modal
- [x] Frontend: ShareCodeModal - New modal
- [x] Frontend: StartGameModal - Add Share button for owned boards
- [x] Frontend: BingoPage - Add share info popover + Save Theme button
- [ ] Testing - Verify all flows work

---

## Phase 4: Advanced Features

### Feature 1: Full Multiplayer with Real-Time Sync

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

## Phase 5: Polish & Production Readiness

### Error Handling
- [ ] Add global error boundary in Vue
- [x] Add toast notifications for API failures
- [ ] Add retry logic for failed API calls

### UX Improvements
- [ ] Add loading spinners during API calls
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add "Leave Game" confirmation

### Code Quality
- [ ] Extract `BingoPage.vue` logic into `useBingoGame.ts` composable
- [x] Create `useToast.ts` utility for Ionic toasts
- [ ] Add consistent error handling pattern across components

### Production
- [ ] Configure CORS for production domain
- [ ] Add rate limiting to API endpoints
- [ ] Add input validation (express-validator)
- [ ] Set up proper logging (Winston/Pino)

---

## Dependencies

```
Phase 1 Core Game Fix → Phase 2 Board CRUD (needs working boards)
Phase 2 Core Features → Phase 3 Shareable Boards (needs working boards)
Phase 4 Advanced Features (multiplayer) → Phase 4 WebSockets
Phase 4 Themes → Independent (can parallelize with Phase 3)
```

---

## Model Usage Recommendations

| Phase | Recommended Model | Reasoning |
|-------|-------------------|-----------|
| Phase 1 (Fixes) | Coding model | Small fixes, no architecture decisions |
| Phase 2 (Core) | Coding model | CRUD endpoints - straightforward |
| Phase 3 (Shareable) | Planning → Coding | Need design decisions first |
| Phase 4.1 (Multiplayer) | Planning → Coding | Architecture decisions critical |
| Phase 4.2 (Themes) | Coding model | Straightforward CSS |
| Phase 4.3 (WebSockets) | Planning → Coding | Architecture decisions critical |
| Phase 5 (Polish) | Coding model | Incremental improvements |

---

## Notes

- Route Protection is optional - auth works without it, it's just for better UX.
- State management (Pinia) is not needed for current features. Would only be beneficial for Phase 4 multiplayer when WebSocket state synchronization becomes necessary.
