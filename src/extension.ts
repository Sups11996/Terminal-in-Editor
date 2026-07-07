import * as vscode from "vscode";
import { editorTerminals } from "./terminalState";
import { registerCommandsToSkipShell, unregisterCommandsToSkipShell } from "./shellIntegration";
import { registerToggleCommand, registerCloseCommand } from "./commands";

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

export function deactivate() {
  unregisterCommandsToSkipShell();
}
