import * as vscode from "vscode";
import { editorTerminals, resolveTerminal, isEditorTerminal } from "./terminalState";

const CONFIG_SECTION = "terminalInEditor";

/**
 * Registers the "Toggle Terminal Location" command (Ctrl+Shift+').
 *
 * - Active terminal is in editor → moves it back to the panel.
 * - Otherwise → moves the active/last panel terminal into the editor,
 *   or creates a new terminal if none exists.
 */
export function registerToggleCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "terminal-in-editor.toggleTerminalLocation",
    async () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const focusTerminal = config.get<boolean>("focusTerminal", true);

      const active = vscode.window.activeTerminal;

      // Terminal is already in the editor — move it back to the panel.
      if (active && isEditorTerminal(active)) {
        await vscode.commands.executeCommand(
          "workbench.action.terminal.moveToTerminalPanel",
        );
        editorTerminals.delete(active);
        return;
      }

      // Move a panel terminal into the editor, or create a new one.
      let terminal = resolveTerminal();

      if (!terminal) {
        // Subscribe BEFORE creating so we never miss the open event.
        const readyPromise = new Promise<void>((resolve) => {
          const disposable = vscode.window.onDidOpenTerminal(() => {
            disposable.dispose();
            resolve();
          });
        });
        terminal = vscode.window.createTerminal();
        await readyPromise;
      }

      // Guard: already tracked as an editor terminal, nothing to do.
      if (isEditorTerminal(terminal)) {
        return;
      }

      terminal.show();
      await vscode.commands.executeCommand(
        "workbench.action.terminal.moveToEditor",
      );
      editorTerminals.add(terminal);

      if (!focusTerminal) {
        await vscode.commands.executeCommand(
          "workbench.action.focusActiveEditorGroup",
        );
      }
    },
  );
}

/**
 * Registers the "Close Editor Terminal" command (Ctrl+W).
 *
 * Prompts the user before killing an editor terminal.
 * The prompt can be disabled via the `terminalInEditor.confirmOnClose`
 * setting — when off, the terminal is killed immediately.
 */
export function registerCloseCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "terminal-in-editor.closeEditorTerminal",
    async () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const onClose = config.get<string>("confirmOnClose", "ask");

      const terminal = vscode.window.activeTerminal;

      // Not one of our terminals — fall through to normal tab close.
      if (!terminal || !isEditorTerminal(terminal)) {
        await vscode.commands.executeCommand(
          "workbench.action.closeActiveEditor",
        );
        return;
      }

      if (onClose === "kill") {
        // Kill immediately, no prompt.
        editorTerminals.delete(terminal);
        terminal.dispose();

      } else if (onClose === "moveToPanel") {
        // Always move back to panel instead of killing.
        await vscode.commands.executeCommand(
          "workbench.action.terminal.moveToTerminalPanel",
        );
        editorTerminals.delete(terminal);

      } else {
        // "ask" — show confirmation prompt.
        const choice = await vscode.window.showWarningMessage(
          `Kill terminal "${terminal.name}"?`,
          { modal: true },
          "Kill Terminal",
        );

        if (choice === "Kill Terminal") {
          editorTerminals.delete(terminal);
          terminal.dispose();
        }
        // Dismissed (Escape) → terminal stays open.
      }
    },
  );
}
