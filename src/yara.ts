import * as vscode from "vscode";
import * as proc from "child_process";

export class Yara {
    private config: vscode.WorkspaceConfiguration;
    private statusBarItem: vscode.StatusBarItem;
    private diagCollection: vscode.DiagnosticCollection;
    private yarac: string;
    private yara: string;

    // called on creation
    constructor() {
        this.config = vscode.workspace.getConfiguration("yara");
        if (this.config.has("installPath") && this.config.get("installPath") != null) {
            this.yarac = this.config.get("installPath") + "\\yarac";
            this.yara = this.config.get("installPath") + "\\yara"
        }
        else {
            // assume YARA binaries are in users $PATH if none is specified
            this.yarac = "yarac";
            this.yara = "yara";
        }
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.diagCollection = vscode.languages.createDiagnosticCollection("yara");
    }

    // Compile the current file
    public compileRule(doc: null|vscode.TextDocument) {
        let diagnostics: Array<vscode.Diagnostic> = [];
        // need to initialize to null otherwise a compile error will happen in the else block
        let ofile_path: string|null = this.config.get("compiled", "~\\AppData\\Local\\yara_tmp.bin").toString();
        const ofile: vscode.Uri = vscode.Uri.file(ofile_path);
        const editor: vscode.TextEditor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Couldn't get the text editor");
            return;
        }
        if (!doc) {
            doc = editor.document;
        };
        // run a sub-process and capture STDOUT to see what errors we have
        // consofle.log(`compileRule: ${this.yarac} ${doc.fileName} ${ofile.toString()}`);
        const result: proc.ChildProcess = proc.spawn(this.yarac, [doc.fileName, ofile.toString()]);
        result.stderr.on('data', (data) => {
            data.toString().split("\n").forEach(line => {
                let current: vscode.Diagnostic|null = this.convertStderrToDiagnostic(line, doc);
                if (current != null) {
                    diagnostics.push(current);
                }
            });
        });
        result.on("close", (code) => {
            this.diagCollection.set(vscode.Uri.file(doc.fileName), diagnostics);
            if (diagnostics.length == 0) {
                // status bar message goes away after 3 seconds
                vscode.window.setStatusBarMessage("File compiled successfully!", 3000);
            }
        });
        return result;
    }

    // Parse YARA STDERR output and create Diagnostics for the window
    private convertStderrToDiagnostic(line, doc) {
        try {
            // regex to match line number in resulting YARAC output
            const pattern: RegExp = RegExp("\\([0-9]+\\)");
            let parsed:Array<string> = line.trim().split(": ");
            // dunno why this adds one to the result - for some reason the render is off by a line
            let matches: RegExpExecArray = pattern.exec(parsed[0]);
            let severity: vscode.DiagnosticSeverity = parsed[1] == "error" ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning;
            if (matches != null) {
                // remove the surrounding parentheses
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
            // console.log(`Typescript Error: ${error}`);
            return null;
        }
    }

    // Execute the current file against a pre-defined target file
    public executeRule(doc: null|vscode.TextDocument) {
        let diagnostics: Array<vscode.Diagnostic> = [];
        let target_file: string|null = this.config.get("target").toString();
        if (!target_file) {
            vscode.window.showErrorMessage("Cannot execute file. Please specify a target file in settings");
        }
        const tfile: vscode.Uri = vscode.Uri.file(target_file);
        const editor: vscode.TextEditor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Couldn't get the text editor");
            return;
        }
        if (!doc) {
            doc = editor.document;
        };
        // run a sub-process and capture STDOUT to see what errors we have
        // console.log(`executeRule: ${this.yara} ${doc.fileName} ${tfile.fsPath}`);
        let matches = 0;
        const result: proc.ChildProcess = proc.spawn(this.yara, [doc.fileName, tfile.fsPath]);
        const pattern: RegExp = RegExp("\\([0-9]+\\)");
        result.stdout.on('data', (data) => {
            data.toString().split("\n").forEach(line => {
                if (line.trim() != "") {
                    // console.log(`stdout: ${line}`);
                    vscode.window.showInformationMessage(line);
                    matches++;
                }
            });
        });
        result.stderr.on('data', (data) => {
            data.toString().split("\n").forEach(line => {
                let current: vscode.Diagnostic|null = this.convertStderrToDiagnostic(line, doc);
                if (current != null) {
                    diagnostics.push(current);
                }
            });
        });
        result.on('close', (code) => {
            this.diagCollection.set(vscode.Uri.file(doc.fileName), diagnostics);
            // purely for testing purposes
        });
        return result;
    }

    // VSCode must dispose of the Yara object in some way
    // Define how we want our disposal to occur
    public dispose() {
        this.statusBarItem.dispose();
        this.diagCollection.dispose();
    }
}