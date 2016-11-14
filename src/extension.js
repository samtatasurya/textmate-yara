"use strict";

const exec = require("child_process").exec;
const vscode = require("vscode");
const config = vscode.workspace.getConfiguration("yara");

function display_streams(error, stdout, stderr) {
    if (error) {
        console.error(error.message);
        var disposable = vscode.window.showErrorMessage(error.message);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    return "No compilation errors"
}

function cmd_compileRule () {
    var basePath = "C:\\Users\\Thomas\\Documents\\GitHub\\textmate-yara\\";
    var yaracPath = config.installPath + "\\yarac64.exe";
    var currentFile = vscode.workspace.textDocuments[0].fileName;
    var testFile = basePath + "examples\\test.yara";
    var outputFile = basePath + "examples\\output.yara";
    var cmd = yaracPath + " " + currentFile + " " + outputFile;
    console.log("Compiling " + currentFile + " with " + yaracPath);
    exec(cmd, display_streams);
}

function cmd_testRule () {
    var yaraPath = config.installPath + "\\yara64.exe";
    var currentFile = vscode.workspace.textDocuments[0].fileName;
//    console.log("Invoking " + yaraPath + " against " + currentFile);
    exec(yaraPath, args);
}

// extension entry point - must be reachable by VSCode
function activate(context) {
    console.log("[*] Installing YARA extension's commands");
    if (config.installPath != null) {
        var compileRule = vscode.commands.registerCommand("yara.CompileRule", cmd_compileRule);
        var testRule = vscode.commands.registerCommand("yara.TestRule", cmd_testRule);
//        vscode.workspace.OnDidSaveTextDocument(cmd_compileRule);
        context.subscriptions.push(compileRule);
        context.subscriptions.push(testRule);
    }
    else {
        console.log("[*] No YARA install found!");
        var disposable = vscode.window.showErrorMessage("No YARA installation folder specified!");
        context.subscriptions.push(disposable);
    }
}
exports.activate = activate;

// extension exit point - must be reachable by VSCode
function deactivate() {
    console.log("[*] Uninstalling YARA commands");
}
exports.deactivate = deactivate;