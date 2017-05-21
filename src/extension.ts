"use strict";

import * as vscode from "vscode";
import * as ext from "./yara";


function activate(context: vscode.ExtensionContext) {
    console.log("Activating Yara extension");
    const YARA_MODE: vscode.DocumentFilter = { language: 'yara', scheme: 'file' };
    let yara = new ext.Yara();
    // Dispose of our objects later
    context.subscriptions.push(yara);
}

function deactivate(context: vscode.ExtensionContext) {
    console.log("Deactivating Yara extension");
}

exports.activate = activate;
exports.deactivate = deactivate;
