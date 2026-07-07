import * as vscode from "vscode";

/**
 * Tracks terminals that have been moved into the editor area by
 * this extension so we can correctly toggle them back to the panel.
 */
export const editorTerminals = new Set<vscode.Terminal>();

/**
 * Resolves which terminal to move into the editor area.
 *
 * Preference order:
 *   1. The active terminal (focused right now).
 *   2. The most recently created terminal not already in the editor.
 *
 * Returns `undefined` only when there are truly no terminals at all,
 * which tells the caller to create a fresh one.
 */
export function resolveTerminal(): vscode.Terminal | undefined {
  if (vscode.window.activeTerminal) {
    return vscode.window.activeTerminal;
  }

  const panelTerminals = vscode.window.terminals.filter(
    (t) => !editorTerminals.has(t),
  );

  if (panelTerminals.length > 0) {
    return panelTerminals[panelTerminals.length - 1];
  }

  return undefined;
}
