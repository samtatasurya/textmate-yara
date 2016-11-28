"use strict";

import * as vscode from "vscode";

// Compile our YARA rule(s) and display any errors, if they exist
function cmdCompileRule() {
	vscode.window.showInformationMessage("Compile YARA Rule!");
}

// Run our YARA rule(s) against a test file
function cmdTestRule() {
    vscode.window.showInformationMessage("Test YARA Rule!");
}

export function activate(context: vscode.ExtensionContext) {
    // Registering our simple commands to call here
	var compileDisposable = vscode.commands.registerCommand('yara.CompileRule', cmdCompileRule);
    var testDisposable = vscode.commands.registerCommand('yara.TestRule', cmdTestRule);
    // Letting VSCode know that we will want to use these commands
	context.subscriptions.push(compileDisposable);
    context.subscriptions.push(testDisposable);
}