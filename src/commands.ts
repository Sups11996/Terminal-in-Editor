import * as vscode from "vscode";
import { editorTerminals, resolveTerminal, isEditorTerminal, updateStatusBar } from "./terminalState";

const CONFIG_SECTION = "terminalInEditor";

/**
 * Registers the "Toggle Terminal Location" command (Ctrl+Shift+').
 *
 * - Active terminal is in editor → moves it back to the panel.
 * - Multiple panel terminals → shows a quick-pick to choose which to move.
 * - No terminals → creates a new one directly in the editor.
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
        updateStatusBar();
        return;
      }

      // Resolve which panel terminal to move (may show a quick-pick).
      let terminal = await resolveTerminal();

      if (!terminal) {
        // No panel terminals — create a new one directly in the editor.
        // We subscribe to onDidOpenTerminal BEFORE calling createTerminal to
        // guarantee we never miss the event, even if it fires synchronously.
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
      updateStatusBar();

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
 * Behavior is controlled by the `terminalInEditor.confirmOnClose` setting:
 * - `ask` — shows a confirmation prompt (default)
 * - `kill` — kills immediately
 * - `moveToPanel` — moves back to panel instead of killing
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
        editorTerminals.delete(terminal);
        updateStatusBar();
        terminal.dispose();

      } else if (onClose === "moveToPanel") {
        await vscode.commands.executeCommand(
          "workbench.action.terminal.moveToTerminalPanel",
        );
        editorTerminals.delete(terminal);
        updateStatusBar();

      } else {
        // "ask" — show confirmation prompt.
        const choice = await vscode.window.showWarningMessage(
          `Kill terminal "${terminal.name}"? (Press Escape to cancel)`,
          { modal: true },
          "Kill Terminal",
        );

        if (choice === "Kill Terminal") {
          editorTerminals.delete(terminal);
          updateStatusBar();
          terminal.dispose();
        }
        // Dismissed (Escape) → terminal stays open.
      }
    },
  );
}
