# Changelog

All notable changes to Terminal in Editor are documented here.

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
