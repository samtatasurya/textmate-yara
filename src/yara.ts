import * as vscode from "vscode";

export class Yara {
    private config;
    private statusBarItem: vscode.StatusBarItem;
    private errors: Array<string>;

    // called on creation
    constructor() {
        this.config = vscode.workspace.getConfiguration("yara");
        this.errors = [];
    }

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
        vscode.window.setStatusBarMessage("${ count } errors");
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