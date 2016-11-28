"use strict";

import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    console.log("[*] Inside activate!");
	var compileDisposable = vscode.commands.registerCommand('yara.CompileRule', () => {
		vscode.window.showInformationMessage("Compile YARA Rule!");
	});
    var testDisposable = vscode.commands.registerCommand('yara.TestRule', () => {
        vscode.window.showInformationMessage("Test YARA Rule!");
    });
	context.subscriptions.push(compileDisposable);
    context.subscriptions.push(testDisposable);
}