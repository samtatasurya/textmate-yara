"use strict";

import * as vscode from "vscode";
import * as ext from "./yara";


function activate(context: vscode.ExtensionContext) {
    console.log("Activating Yara extension");
    const YARA_MODE: vscode.DocumentFilter = { language: 'yara', scheme: 'file' };
    let config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("yara");
    let yara = new ext.Yara();
    let compileRule = vscode.commands.registerTextEditorCommand("yara.CompileRule", () => {yara.compileRule(null)});
    let execRule = vscode.commands.registerTextEditorCommand("yara.ExecuteRule", () => {yara.executeRule(null)});
    if (config.get("compileOnSave")) {
        let saveSubscription = vscode.workspace.onDidSaveTextDocument(() => {yara.compileRule(null)});
        context.subscriptions.push(saveSubscription);
    }
    // Dispose of our objects later
    context.subscriptions.push(yara);
    context.subscriptions.push(compileRule);
    context.subscriptions.push(execRule);
}

function deactivate(context: vscode.ExtensionContext) {
    console.log("Deactivating Yara extension");
}

exports.activate = activate;
exports.deactivate = deactivate;
