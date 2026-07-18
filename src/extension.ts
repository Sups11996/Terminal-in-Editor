import * as vscode from "vscode";
import { editorTerminals, initStatusBar, updateStatusBar } from "./terminalState";
import { registerCommandsToSkipShell, unregisterCommandsToSkipShell } from "./shellIntegration";
import { registerToggleCommand, registerCloseCommand } from "./commands";

const CONFIG_SECTION = "terminalInEditor";

/**
 * Called by VS Code when the extension is first activated.
 * Registers commands, keybinding overrides, and terminal lifecycle listeners.
 */
export async function activate(context: vscode.ExtensionContext) {
  // Ensure Ctrl+W and Ctrl+Shift+' reach VS Code even inside Git Bash.
  await registerCommandsToSkipShell();

  // Initialise the status bar item.
  initStatusBar(context);

  // Cleanup tracking when a terminal is closed by any means.
  const onCloseDisposable = vscode.window.onDidCloseTerminal((terminal) => {
    editorTerminals.delete(terminal);
    updateStatusBar();
  });

  // Auto-move new terminals into the editor if the setting is enabled.
  const onOpenDisposable = vscode.window.onDidOpenTerminal(async (terminal) => {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const autoMove = config.get<boolean>("autoMoveNewTerminals", false);

    if (!autoMove) {
      return;
    }

    // Wait 150ms for the terminal process to fully initialise before issuing
    // the move command. Without this delay, the terminal tab may not yet exist
    // in the editor group and the command silently does nothing.
    await new Promise<void>((resolve) => setTimeout(resolve, 150));

    terminal.show();
    await vscode.commands.executeCommand(
      "workbench.action.terminal.moveToEditor",
    );
    editorTerminals.add(terminal);
    updateStatusBar();
  });

  context.subscriptions.push(
    registerToggleCommand(),
    registerCloseCommand(),
    onCloseDisposable,
    onOpenDisposable,
  );
}

/**
 * Called by VS Code when the extension is deactivated.
 * Restores the user's original `commandsToSkipShell` setting.
 */
export function deactivate() {
  unregisterCommandsToSkipShell();
}
