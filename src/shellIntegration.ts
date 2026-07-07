import * as vscode from "vscode";

const COMMANDS_TO_SKIP = [
  "terminal-in-editor.closeEditorTerminal",
  "terminal-in-editor.toggleTerminalLocation",
];

/**
 * Adds our commands to `terminal.integrated.commandsToSkipShell` so
 * shells like Git Bash don't intercept Ctrl+W / Ctrl+Shift+' before
 * VS Code can handle them.
 */
export async function registerCommandsToSkipShell(): Promise<void> {
  const config = vscode.workspace.getConfiguration("terminal.integrated");
  const existing: string[] = config.get("commandsToSkipShell", []);
  const merged = Array.from(new Set([...existing, ...COMMANDS_TO_SKIP]));
  if (merged.length !== existing.length) {
    await config.update(
      "commandsToSkipShell",
      merged,
      vscode.ConfigurationTarget.Global,
    );
  }
}

/**
 * Removes our commands from `commandsToSkipShell` when the extension
 * is deactivated, restoring the user's original state.
 */
export function unregisterCommandsToSkipShell(): void {
  const config = vscode.workspace.getConfiguration("terminal.integrated");
  const existing: string[] = config.get("commandsToSkipShell", []);
  const cleaned = existing.filter((c) => !COMMANDS_TO_SKIP.includes(c));
  if (cleaned.length !== existing.length) {
    config.update(
      "commandsToSkipShell",
      cleaned,
      vscode.ConfigurationTarget.Global,
    );
  }
}
