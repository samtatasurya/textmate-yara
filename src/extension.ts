"use strict";

import * as vscode from "vscode";
// import ext = require("./yara");

export class Yara {
    private config: vscode.WorkspaceConfiguration;
    private statusBarItem: vscode.StatusBarItem;
    private errors: Array<string>;

    // called on creation
    constructor() {
        this.config = vscode.workspace.getConfiguration("yara");
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
        this.errors = [];
    }

    // Compile the current file
    public compileRule() {
        let yarac = this.config.get("installPath") + "\\yarac64.exe";
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.log("Couldn't get the text editor");
            return;
        }
        let doc = editor.document;
        if (!doc) {
            console.log("Couldn't get the active text document");
            return;
        }
        console.log(yarac + " " + doc.fileName + " FILE");
        let leaf = doc.fileName.split("\\").pop();
        if (this.errors.length == 0) {
            vscode.window.setStatusBarMessage("Compiled " + leaf + " successfully!");
        }
        else {
            vscode.window.setStatusBarMessage("Failed to compile " + leaf);
        }
    }

    // VSCode must dispose of the Yara object in some way
    // Define how we want our disposal to occur
    public dispose() {
        this.statusBarItem.dispose();
    }
}

function activate(context: vscode.ExtensionContext) {
    console.log("[*] Activating Yara extension")
    let file_selector = { language: 'Yara', scheme: 'file' };
    // console.log();
    // Create our YARA object to do everything with
    // let yara = new ext.Yara();
    let yara = new Yara();
    let compileRule = vscode.commands.registerCommand("yara.CompileRule", () => {yara.compileRule()});
    // Dispose of our objects later
    context.subscriptions.push(yara);
    context.subscriptions.push(compileRule);
}

function deactivate(context: vscode.ExtensionContext) {
    console.log("[*] Deactivating Yara extension")
}

exports.activate = activate
exports.deactivate = deactivate
