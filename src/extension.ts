"use strict";

import * as vscode from "vscode";
import * as path from "path";


// hopefully there's a better way of instantiating these variables
let config: vscode.WorkspaceConfiguration;
let statusBarItem: vscode.StatusBarItem;
let diagCollection: vscode.DiagnosticCollection;
let yarac: string;
let yara: string;
let configWatcher: vscode.Disposable = null;
let saveSubscription: vscode.Disposable = null;
let compileCommand: vscode.Disposable = null;

/*
    Called on configuration changes (vscode.onDidChangeConfiguration)
    Clears the old configuration settings and sets new values

    :context: The YARA extension's current, private context
*/
function updateSettings(context: vscode.ExtensionContext) {
    console.log("Updating configuration settings");
    let saveSubscription: vscode.Disposable = context.subscriptions["saveSubscription"];
    let compileCommand: vscode.Disposable = context.subscriptions["compileCommand"];
    // reset the configuration
    if (saveSubscription) { saveSubscription.dispose(); }
    if (compileCommand) { compileCommand.dispose(); }

    let config = vscode.workspace.getConfiguration("yara");
    // set up everything if the user wants to use the YARA commands
    if (config.get("commands")) {
        compileCommand = vscode.commands.registerTextEditorCommand("yara.CompileRule", () => {
            compileRule(null)
        });
        if (config.has("installPath") && config.get("installPath")) {
            let installPath = <string> config.get("installPath");
            yarac = path.join(installPath, "yarac");
        }
        else {
            // assume YARA binaries are in user's PATH. If not, we'll handle errors later
            yarac = "yarac";
            yara = "yara";
        }

        if (config.get("compileOnSave")) {
            saveSubscription = vscode.workspace.onDidSaveTextDocument(() => {compileRule(null)});
        }
        else if (saveSubscription) {
            saveSubscription.dispose();
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log("Activating Yara extension");
    configWatcher = vscode.workspace.onDidChangeConfiguration(() => {
        updateSettings(context)
    });
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    diagCollection = vscode.languages.createDiagnosticCollection("yara");
    // start pushing things into our context to reuse later
    context.subscriptions.push(configWatcher);
    context.subscriptions.push(saveSubscription);
    context.subscriptions.push(diagCollection);
};

export function deactivate(context: vscode.ExtensionContext) {
    console.log("Deactivating Yara extension");
    context.subscriptions.forEach(disposable => {
        disposable.dispose();
    });
};
