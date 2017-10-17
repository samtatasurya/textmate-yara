"use strict";

import * as proc from "child_process";
import * as path from "path";
import * as vscode from "vscode";


// hopefully there's a better way of instantiating these variables
let config: vscode.WorkspaceConfiguration;
let statusBarItem: vscode.StatusBarItem;
let diagCollection: vscode.DiagnosticCollection;
let yarac: string;
let yara: string;
let configWatcher: vscode.Disposable = null;
let saveSubscription: vscode.Disposable = null;
let compileCommand: vscode.Disposable = null;

/*
    Called on-demand or on file saves (yara.CompileRule & onDidSaveTextDocument)
    Compile the current file in the VSCode workspace as a YARA rule

    :doc: The current workspace document if null or a vscode.TextDocument object
*/
export function compileRule(doc: null|vscode.TextDocument) {
    let diagnostics: Array<vscode.Diagnostic> = [];
    let ofile_path: string = this.config.get("compiled", "~/.yara_tmp.bin").toString();
    let flags: string[]|null = this.config.get("compileFlags", null);
    const ofile: vscode.Uri = vscode.Uri.file(ofile_path);
    const editor: vscode.TextEditor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("Couldn't get the text editor");
        return new Promise((resolve, reject) => { null; });
    }
    else if (editor.document.languageId != "yara") {
        console.log(`Can't compile ${editor.document.fileName} - not a YARA file`);
        return new Promise((resolve, reject) => { null; });
    }
    if (!doc) {
        doc = editor.document;
    };
    if (!flags) {
        flags = [doc.fileName, ofile.toString()];
    }
    else {
        flags = flags.concat([doc.fileName, ofile.toString()]);
    }
    console.log(`${this.yarac} ${flags.join(" ")}`);
    // run a sub-process and capture STDERR to see what errors we have
    const promise = new Promise((resolve, reject) => {
        const result: proc.ChildProcess = proc.spawn(this.yarac, flags);
        let errors:string|null = null;
        let diagnostic_errors: number = 0;
        result.stderr.on('data', (data) => {
            data.toString().split("\n").forEach(line => {
                let current: vscode.Diagnostic|null = this.convertStderrToDiagnostic(line, doc);
                if (current != null) {
                    diagnostics.push(current);
                    if (current.severity == vscode.DiagnosticSeverity.Error) {
                        // track how many Error diagnostics there are to determine if file compiled or not later
                        diagnostic_errors++;
                    }
                }
                else if (line.startsWith("unknown option")) {
                    vscode.window.showErrorMessage(`CompileFlags: ${line}`);
                    errors = line;
                }
            });
        });
        result.on("error", (err) => {
            errors = err.message.endsWith("ENOENT") ? "Cannot compile YARA rule. Please specify an install path" : `Error: ${err.message}`;
            vscode.window.showErrorMessage(errors);
            reject(errors);
        });
        result.on("close", (code) => {
            this.diagCollection.set(vscode.Uri.file(doc.fileName), diagnostics);
            if (diagnostic_errors == 0 && errors == null) {
                // status bar message goes away after 3 seconds
                vscode.window.setStatusBarMessage("File compiled successfully!", 3000);
            }
            resolve(diagnostics);
        });
    });
    return promise;
}

/*
    Parse YARA STDERR output and create Diagnostics for the window

    :line: The YARA command's current output line
    :doc: The current workspace document to draw diagnostics data on
*/
function convertStderrToDiagnostic(line: string, doc: vscode.TextDocument) {
    try {
        // regex to match line number in resulting YARAC output
        const pattern: RegExp = RegExp("\\([0-9]+\\)");
        let parsed:Array<string> = line.trim().split(": ");
        // dunno why this adds one to the result - for some reason the render is off by a line
        let matches: RegExpExecArray = pattern.exec(parsed[0]);
        let severity: vscode.DiagnosticSeverity = parsed[1] == "error" ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning;
        if (matches != null) {
            // console.log(`Compiler Output: ${line}`);
            // remove the surrounding parentheses
            // VSCode render is off by one, and I'm not sure why. Have to subtract one to *generally* get the correct line
            let line_no: number = parseInt(matches[0].replace("(", "").replace(")", "")) - 1;
            let start: vscode.Position = new vscode.Position(line_no, doc.lineAt(line_no).firstNonWhitespaceCharacterIndex);
            let end: vscode.Position = new vscode.Position(line_no, Number.MAX_VALUE);
            let line_range: vscode.Range = new vscode.Range(start, end);
            return new vscode.Diagnostic(line_range, parsed.pop(), severity);
        }
        return null;
    }
    catch (error) {
        vscode.window.showErrorMessage(error);
        return null;
    }
}

/*
    Called on configuration changes (vscode.onDidChangeConfiguration)
    Clears the old configuration settings and sets new values

    :context: The YARA extension's current, private context
*/
export function updateSettings(context: vscode.ExtensionContext) {
    console.log("Updating configuration settings");
    let saveSubscription: vscode.Disposable = context.subscriptions["saveSubscription"];
    let compileCommand: vscode.Disposable = context.subscriptions["compileCommand"];
    // reset the configuration
    if (saveSubscription) { saveSubscription.dispose(); }
    if (compileCommand) { compileCommand.dispose(); }

    let config = vscode.workspace.getConfiguration("yara");
    // set up everything if the user wants to use the YARA commands
    if (config.get("commands")) {
        compileCommand = vscode.commands.registerTextEditorCommand("yara.CompileRule", () => {
            compileRule(null)
        });
        context.subscriptions.push(compileCommand);

        if (config.has("installPath") && config.get("installPath")) {
            let installPath = <string> config.get("installPath");
            yarac = path.join(installPath, "yarac");
        }
        else {
            // assume YARA binaries are in user's PATH. If not, we'll handle errors later
            yarac = "yarac";
            yara = "yara";
        }

        if (config.get("compileOnSave")) {
            saveSubscription = vscode.workspace.onDidSaveTextDocument(() => {
                compileRule(null)
            });
            context.subscriptions.push(saveSubscription);
        }
        else if (saveSubscription) {
            saveSubscription.dispose();
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log("Activating Yara extension");
    configWatcher = vscode.workspace.onDidChangeConfiguration(() => {updateSettings(context)});
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    diagCollection = vscode.languages.createDiagnosticCollection("yara");
    // start pushing things into our context to reuse later
    context.subscriptions.push(configWatcher);
    context.subscriptions.push(saveSubscription);
    context.subscriptions.push(diagCollection);
    // perform our initial setup of config values & subscriptions
    updateSettings(context);
};

export function deactivate(context: vscode.ExtensionContext) {
    console.log("Deactivating Yara extension");
    context.subscriptions.forEach(disposable => {
        disposable.dispose();
    });
};
