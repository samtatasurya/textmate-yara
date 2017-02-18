"use strict";

import * as vscode from "vscode";
import * as proc from "child_process";

class Yara {
    private config: vscode.WorkspaceConfiguration;
    private statusBarItem: vscode.StatusBarItem;

    // called on creation
    constructor() {
        this.config = vscode.workspace.getConfiguration("yara");
        if (!this.config.has("installPath")) {
            vscode.window.showErrorMessage("No YARA installation specified! Please set one in settings");
            return;
        }
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
    }

    // Compile the current file
    public compileRule() {
        const ofile: vscode.Uri = vscode.Uri.file("~\\AppData\\Local\\compiled.yarac");
        let errors: Array<string> = [];
        let exit_code: number = 0;
        let yarac: string = this.config.get("installPath") + "\\yarac64.exe";

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Couldn't get the text editor");
            return;
        }
        let doc = editor.document;
        if (!doc) {
            vscode.window.showErrorMessage("Couldn't get the active text document");
            return;
        };
        // run a sub-process and capture STDOUT to see what errors we have
        const result = proc.spawn(yarac, [doc.fileName, ofile.toString()]);
        // regex to match line number in resulting YARAC output
        const pattern = RegExp("\([0-9]+\)");
        result.stderr.on('data', (data) => {
            console.log(`stderr: ${data.toString()}`);
            let messages = data.toString().trim().split(": ");
            let line_no = pattern.exec(messages[0])[0];
            let msg = messages.pop();
            console.log(msg);
            console.log(line_no);
        });
        result.stdout.on('data', (data) => {
            console.log(`stdout: ${data.toString()}`);
        });
        result.on("close", (code) => {
            exit_code = code;
        });
        // relay child process results to the user
        let leaf = doc.fileName.split("\\").pop();
        let message = "";
        if (exit_code == 0) {
            message = `Compiled ${leaf} successfully!`;
        }
        else {
            message = `Failed to compile ${leaf}: exit code ${exit_code}`;
            errors.forEach(errormsg => {
                console.log(`[-] ${errormsg}`);
            });
        }
        this.statusBarItem.text = message;
        this.statusBarItem.show();
    }

    // Run the current file against a target specified in settings
    public executeRule() {
        let yara = this.config.get("installPath") + "\\yara64.exe";

        if (!this.config.has("target")) {
            vscode.window.showErrorMessage("You must set a YARA target file!");
            return;
        }
        let target = this.config.get("target");

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Couldn't get the text editor");
            return;
        }

        let doc = editor.document;
        if (!doc) {
            vscode.window.showErrorMessage("Couldn't get the activate text document");
            return;
        }

        let options = this.config.get("options");
        if (options != "null") {
            console.log(`${yara} ${options} ${doc.fileName} ${target}`);
        }
        else {
            console.log(`${yara} ${doc.fileName} ${target}`);
        }
    }

    // VSCode must dispose of the Yara object in some way
    // Define how we want our disposal to occur
    public dispose() {
        this.statusBarItem.dispose();
    }
}

function activate(context: vscode.ExtensionContext) {
    console.log("Activating Yara extension")
    const YARA_MODE: vscode.DocumentFilter = { language: 'yara', scheme: 'file' };
    let yara = new Yara();
    let saveSubscription = vscode.workspace.onDidSaveTextDocument(() => {yara.compileRule()})
    let compileRule = vscode.commands.registerCommand("yara.CompileRule", () => {yara.compileRule()});
    let execRule = vscode.commands.registerCommand("yara.ExecRule", () => {yara.executeRule()});
    // Dispose of our objects later
    context.subscriptions.push(yara);
    context.subscriptions.push(saveSubscription);
    context.subscriptions.push(compileRule);
    context.subscriptions.push(execRule);
}

function deactivate(context: vscode.ExtensionContext) {
    console.log("Deactivating Yara extension");
}

exports.activate = activate;
exports.deactivate = deactivate;
