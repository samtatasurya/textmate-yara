"use strict";

import * as vscode from "vscode";

function activate(context: vscode.ExtensionContext) {
    console.log("[*] Installing the YARA extension")
    // Create our YARA object to do everything with
    let yara = new Yara();
    // Registering our simple commands to call here
    let compile = vscode.commands.registerCommand("yara.CompileRule", yara.compileRules);
    // Dispose of our objects later
    context.subscriptions.push(yara);
    context.subscriptions.push(compile);
}

function deactivate(context: vscode.ExtensionContext) {
    console.log("[*] Uninstalling the YARA extension")
}

class Yara {
    private config = vscode.workspace.getConfiguration("yara");
    private statusBarItem: vscode.StatusBarItem;
    private errors: Array<string> = [];

    // Display how many errors exist in the current YARA rulefile
    public updateStatusBar() {
        // if this is our first time being created, instantiate the status bar item
        if (!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
        }

        // get the current text editor
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.statusBarItem.hide();
            return;
        }
        // get the currently focused text document
        let doc = editor.document;
        if (!doc) {
            vscode.window.showErrorMessage("Couldn't get the active text document");
            return;
        }
        // ensure this is a YARA document
        else if (doc.languageId != "yara") {
            vscode.window.showErrorMessage("The current document is not a YARA rulefile");
            return;
        }
        let count = this.errors.length;
        let message = "${ count } errors";
        vscode.window.setStatusBarMessage(message);
    }

    // Compile the current text document into a set of rules
    public compileRules() {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Couldn't get the active editor");
            return;
        }
        let doc = editor.document;
        if (!doc) {
            vscode.window.showErrorMessage("Couldn't get the active text document");
            return;
        }
        else if (doc.languageId != "yara") {
            vscode.window.showErrorMessage("The current document is not a YARA rulefile");
            return;
        }
        console.log("Compiling " + doc.fileName);
    }

    // VSCode must dispose of the Yara object in some way
    // Define how we want our disposal to occur
    public dispose() {
        this.statusBarItem.dispose();
    }
}

exports.activate = activate
exports.deactivate = deactivate