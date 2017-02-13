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
        console.log("compileRule()");
        // console.log(this.config.has("installPath"));
        let yarac = this.config.get("installPath") + "\\yarac64.exe";
        console.log("YARAC Path: " + yarac);
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
        console.log("languageId: " + doc.languageId);
        console.log(yarac + " " + doc.fileName + " FILE");
    }

    // Display how many errors exist in the current YARA rulefile
    public updateStatusBar() {
        console.log("updateStatusBar()");
        let count = this.errors.length;
        vscode.window.setStatusBarMessage(count + " errors");
    }

    // VSCode must dispose of the Yara object in some way
    // Define how we want our disposal to occur
    public dispose() {
        this.statusBarItem.dispose();
    }
}

function activate(context: vscode.ExtensionContext) {
    console.log("[*] Installing the YARA extension")
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
    console.log("[*] Uninstalling the YARA extension")
}

exports.activate = activate
exports.deactivate = deactivate
