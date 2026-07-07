import * as vscode from "vscode";

/**
 * Tracks terminals that have been moved into the editor area by
 * this extension so we can correctly toggle them back to the panel.
 *
 * Using a Set ensures O(1) lookup and prevents duplicate entries.
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
 *
 * @returns The terminal to move, or `undefined` if none exist.
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

/**
 * Returns `true` if the given terminal is currently tracked as an editor terminal.
 *
 * @param terminal - The terminal to check.
 */
export function isEditorTerminal(terminal: vscode.Terminal): boolean {
  return editorTerminals.has(terminal);
}
