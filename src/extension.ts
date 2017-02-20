"use strict";

import * as vscode from "vscode";
import * as proc from "child_process";

class Yara {
    private config: vscode.WorkspaceConfiguration;
    private statusBarItem: vscode.StatusBarItem;
    private diagCollection: vscode.DiagnosticCollection;
    private yarac: string;
    private yara: string;

    // called on creation
    constructor() {
        this.config = vscode.workspace.getConfiguration("yara");
        if (this.config.has("installPath")) {
            this.yarac = this.config.get("installPath") + "\\yarac";
            this.yara = this.config.get("installPath") + "\\yara"
        }
        else {
            this.yarac = "yarac";
            this.yara = "yara";
        }
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.diagCollection = vscode.languages.createDiagnosticCollection("yara");
    }

    // Compile the current file
    public compileRule() {
        // need to initialize to null otherwise a compile error will happen in the else block
        let ofile_path = null;
        if (!this.config.has("compiled")) {
            ofile_path = "~\\AppData\\Local\\yara_tmp.bin";
            vscode.window.showWarningMessage(`No 'compiled' target is specified! Compiling to ${ofile_path}`);
            return;
        }
        else {
            ofile_path = this.config.get("compiled");
        }
        const ofile: vscode.Uri = vscode.Uri.file(ofile_path);
        let exit_code: number = 0;
        let diagnostics: Array<vscode.Diagnostic> = [];

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Couldn't get the text editor");
            return;
        }
        const doc = editor.document;
        if (!doc) {
            vscode.window.showErrorMessage("Couldn't get the active text document");
            return;
        };
        // run a sub-process and capture STDOUT to see what errors we have
        const result = proc.spawn(this.yarac, [doc.fileName, ofile.toString()]);
        // regex to match line number in resulting YARAC output
        const pattern = RegExp("\\([0-9]+\\)");
        result.stderr.on('data', (data) => {
            data.toString().split("\n").forEach(line => {
                try {
                    let parsed = line.trim().split(": ");
                    // dunno why this adds one to the result - for some reason the render is off by a line
                    let matches = pattern.exec(parsed[0]);
                    let severity = parsed[1] == "error" ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning;
                    if (matches != null) {
                        // remove the surrounding parentheses
                        let line_no = parseInt(matches[0].replace("(", "").replace(")", "")) - 1;
                        let start = new vscode.Position(line_no, doc.lineAt(line_no).firstNonWhitespaceCharacterIndex);
                        let end = new vscode.Position(line_no, data.length);
                        let line_range = new vscode.Range(start, end);
                        diagnostics.push(new vscode.Diagnostic(line_range, parsed.pop(), severity));
                    }
                }
                catch (error) {
                    vscode.window.showErrorMessage(error);
                    console.log(`Typescript Error: ${error}`);
                }
            });
        });
        result.on("close", (code) => {
            this.diagCollection.set(vscode.Uri.file(doc.fileName), diagnostics);
        });
    }

    // VSCode must dispose of the Yara object in some way
    // Define how we want our disposal to occur
    public dispose() {
        this.statusBarItem.dispose();
        this.diagCollection.dispose();
    }
}

function activate(context: vscode.ExtensionContext) {
    console.log("Activating Yara extension")
    const YARA_MODE: vscode.DocumentFilter = { language: 'yara', scheme: 'file' };
    let yara = new Yara();
    let saveSubscription = vscode.workspace.onDidSaveTextDocument(() => {yara.compileRule()})
    let compileRule = vscode.commands.registerCommand("yara.CompileRule", () => {yara.compileRule()});
    // Dispose of our objects later
    context.subscriptions.push(yara);
    context.subscriptions.push(saveSubscription);
    context.subscriptions.push(compileRule);
}

function deactivate(context: vscode.ExtensionContext) {
    console.log("Deactivating Yara extension");
}

exports.activate = activate;
exports.deactivate = deactivate;
