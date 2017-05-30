import * as vscode from "vscode";
import * as proc from "child_process";

export class Yara {
    private config: vscode.WorkspaceConfiguration;
    private statusBarItem: vscode.StatusBarItem;
    private diagCollection: vscode.DiagnosticCollection;
    private yarac: string;
    private yara: string;
    private configWatcher: vscode.Disposable = null;
    private saveSubscription: vscode.Disposable = null;
    private compileCommand: vscode.Disposable = null;
    private executeCommand: vscode.Disposable = null;

    // called on creation
    constructor() {
        this.updateSettings();
        this.configWatcher = vscode.workspace.onDidChangeConfiguration(() => {this.updateSettings()});
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.diagCollection = vscode.languages.createDiagnosticCollection("yara");
    }

    // callback function when the Yara settings get changed
    public updateSettings() {
        // reset the configuration
        if (this.saveSubscription != null) {this.saveSubscription.dispose();}
        if (this.compileCommand != null) {this.compileCommand.dispose();}
        if (this.executeCommand != null) {this.executeCommand.dispose();}
        this.config = vscode.workspace.getConfiguration("yara");
        // set up everything if the user wants to use the YARA commands
        if (this.config.get("commands")) {
            this.compileCommand = vscode.commands.registerTextEditorCommand("yara.CompileRule", () => {this.compileRule(null)});
            this.executeCommand = vscode.commands.registerTextEditorCommand("yara.ExecuteRule", () => {this.executeRule(null)});
            if (this.config.has("installPath") && this.config.get("installPath") != null) {
                this.yarac = this.config.get("installPath") + "/yarac";
                this.yara = this.config.get("installPath") + "/yara";
            }
            else {
                // assume YARA binaries are in user's PATH. If not, we'll handle errors later
                this.yarac = "yarac";
                this.yara = "yara";
            }

            if (this.config.get("compileOnSave")) {
                this.saveSubscription = vscode.workspace.onDidSaveTextDocument(() => {this.compileRule(null)});
            }
            else if (this.saveSubscription != null) {
                this.saveSubscription.dispose();
            }
        }
    }

    // Compile the current file
    public compileRule(doc: null|vscode.TextDocument) {
        let diagnostics: Array<vscode.Diagnostic> = [];
        let ofile_path: string = this.config.get("compiled", "~/.yara_tmp.bin").toString();
        let flags: string[]|null = this.config.get("compileFlags", null);
        const ofile: vscode.Uri = vscode.Uri.file(ofile_path);
        const editor: vscode.TextEditor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Couldn't get the text editor");
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
        // console.log(`${this.yarac} ${flags.join(" ")}`);
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

    // Execute the current file against a pre-defined target file
    public executeRule(doc: null|vscode.TextDocument) {
        let diagnostics: Array<vscode.Diagnostic> = [];
        let target_file: string = this.config.get("target").toString().replace("${workspaceRoot}", vscode.workspace.rootPath);
        let flags: string[]|null = this.config.get("executeFlags", null);
        if (!target_file) {
            vscode.window.showErrorMessage("Cannot execute YARA rule. Please specify a target file in settings");
            return new Promise((resolve, reject) => { null; });
        }
        const tfile: vscode.Uri = vscode.Uri.file(target_file);
        const editor: vscode.TextEditor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Couldn't get the text editor");
            return new Promise((resolve, reject) => { null; });
        }
        if (!doc) {
            doc = editor.document;
        };
        if (!flags) {
            flags = [doc.fileName, target_file.toString()];
        }
        else {
            flags = flags.concat([doc.fileName, target_file.toString()]);
        }
        // run a sub-process and capture STDOUT to see what errors we have
        const promise = new Promise((resolve, reject) => {
            let matches = [];
            const result: proc.ChildProcess = proc.spawn(this.yara, flags);
            const pattern: RegExp = RegExp("\\([0-9]+\\)");
            result.stdout.on('data', (data) => {
                data.toString().split("\n").forEach(line => {
                    if (line.trim() != "") {
                        // first line in string is the YARA rule name
                        matches.push(line.split(" ")[0]);
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
            result.on("error", (err) => {
                let message:string = err.message.endsWith("ENOENT") ? "Cannot execute YARA rule. Please specify an install path" : err.message;
                vscode.window.showErrorMessage(message);

            });
            result.on('close', (code) => {
                this.diagCollection.set(vscode.Uri.file(doc.fileName), diagnostics);
                if (matches.length > 0) {
                    vscode.window.setStatusBarMessage(`${target_file} matches: ${matches.join(", ")}`, 3000);
                }
                resolve(diagnostics);
            });
        });
        return promise;
    }

    // VSCode must dispose of the Yara object in some way
    // Define how we want our disposal to occur
    public dispose() {
        this.statusBarItem.dispose();
        this.diagCollection.dispose();
        this.configWatcher.dispose();
        if (this.saveSubscription) {
            this.saveSubscription.dispose();
        }
    }
}