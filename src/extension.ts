import * as vscode from "vscode";
import { editorTerminals } from "./terminalState";
import { registerCommandsToSkipShell, unregisterCommandsToSkipShell } from "./shellIntegration";
import { registerToggleCommand, registerCloseCommand } from "./commands";

/**
 * Called by VS Code when the extension is first activated.
 * Registers commands, keybinding overrides, and terminal lifecycle listeners.
 */
export async function activate(context: vscode.ExtensionContext) {
  // Ensure Ctrl+W and Ctrl+Shift+' reach VS Code even inside Git Bash.
  await registerCommandsToSkipShell();

  // Cleanup tracking when a terminal is closed by any means.
  const closeDisposable = vscode.window.onDidCloseTerminal((terminal) => {
    editorTerminals.delete(terminal);
  });

  context.subscriptions.push(
    registerToggleCommand(),
    registerCloseCommand(),
    closeDisposable,
  );
}

/**
 * Called by VS Code when the extension is deactivated.
 * Restores the user's original `commandsToSkipShell` setting.
 */
export function deactivate() {
  unregisterCommandsToSkipShell();
}
