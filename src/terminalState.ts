import * as vscode from "vscode";

/**
 * Tracks terminals that have been moved into the editor area by
 * this extension so we can correctly toggle them back to the panel.
 *
 * Using a Set ensures O(1) lookup and prevents duplicate entries.
 */
export const editorTerminals = new Set<vscode.Terminal>();

/** Status bar item showing how many terminals are currently in the editor. */
let statusBarItem: vscode.StatusBarItem | undefined;

/**
 * Creates and shows the status bar item.
 * Call once from `activate`.
 */
export function initStatusBar(context: vscode.ExtensionContext): void {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  );
  statusBarItem.command = "terminal-in-editor.toggleTerminalLocation";
  statusBarItem.tooltip = "Toggle terminal location (editor / panel)";
  context.subscriptions.push(statusBarItem);
  updateStatusBar();
}

/**
 * Refreshes the status bar text to reflect the current editor terminal count.
 * Call this whenever `editorTerminals` changes.
 */
export function updateStatusBar(): void {
  if (!statusBarItem) {
    return;
  }
  const count = editorTerminals.size;
  if (count === 0) {
    statusBarItem.hide();
  } else {
    statusBarItem.text = `$(terminal) ${count} editor terminal${count === 1 ? "" : "s"}`;
    statusBarItem.show();
  }
}

/**
 * Resolves which terminal to move into the editor area.
 *
 * - If there is only one panel terminal, returns it directly.
 * - If there are multiple, shows a quick-pick so the user can choose.
 * - Returns `undefined` if none exist (caller should create a new one).
 *
 * @returns The chosen terminal, or `undefined` if none exist.
 */
export async function resolveTerminal(): Promise<vscode.Terminal | undefined> {
  const panelTerminals = vscode.window.terminals.filter(
    (t) => !editorTerminals.has(t),
  );

  if (panelTerminals.length === 0) {
    return undefined;
  }

  if (panelTerminals.length === 1) {
    return panelTerminals[0];
  }

  // Multiple terminals — let the user pick.
  const items = panelTerminals.map((t) => ({
    label: `$(terminal) ${t.name}`,
    terminal: t,
  }));

  const picked = await vscode.window.showQuickPick(items, {
    placeHolder: "Select a terminal to move into the editor",
  });

  return picked?.terminal;
}

/**
 * Returns `true` if the given terminal is currently tracked as an editor terminal.
 *
 * @param terminal - The terminal to check.
 */
export function isEditorTerminal(terminal: vscode.Terminal): boolean {
  return editorTerminals.has(terminal);
}
