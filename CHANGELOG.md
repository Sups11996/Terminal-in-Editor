# Changelog

All notable changes to Terminal in Editor are documented here.

## [1.1.0] — 2026-07-10

### Improved
- Lowered minimum VS Code requirement from 1.125.0 to 1.58.0 — compatible with any VS Code released since July 2021

## [1.0.0] — 2026-07-10

### Added
- macOS support — native `Cmd+Shift+'` and `Cmd+W` keybindings for Mac users (Windows and Linux keep `Ctrl`)

## [0.2.0] — 2026-07-08

### Fixed
- Images not rendering on the VS Code Marketplace and GitHub — switched to absolute raw GitHub URLs

### Improved
- Added `isEditorTerminal` helper for cleaner terminal state checks
- Extracted config section and key names into constants to reduce duplication
- Added JSDoc to `activate` and `deactivate` in `extension.ts`

## [0.1.0] — 2026-07-08

### Added
- Move any terminal from the bottom panel into the editor area as a tab
- Toggle terminal back to the panel using the same shortcut (`Ctrl+Shift+'`)
- Automatically creates a new terminal in the editor if none exists
- `Ctrl+W` close behavior configurable via `terminalInEditor.confirmOnClose`:
  - `ask` — prompts before killing (default)
  - `kill` — kills immediately without prompting
  - `moveToPanel` — moves the terminal back to the panel instead of killing
- Works with all shells including Git Bash, PowerShell, and Command Prompt
- `terminalInEditor.focusTerminal` setting to control focus after moving
