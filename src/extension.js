"use strict";

const exec = require("child_process").exec;
const vscode = require("vscode");
const config = vscode.workspace.getConfiguration("yara");

function cmd_compileRule () {
    var yaracPath = config.installPath + "\\yarac64.exe";
    var currentFile = vscode.workspace.textDocuments[0].filename;
    console.log("Compiling " + currentFile + " with " + yaracPath);
    var args = ["C:\\Users\\Thomas\\Documents\\GitHub\\textmate-yara\\examples\\test.yara"];
    exec(yaracPath, args);
}

function cmd_testRule () {
    var yaraPath = config.installPath + "\\yara64.exe";
    var currentFile = vscode.workspace.textDocuments[0].filename;
    console.log("Invoking " + yaraPath + " against " + currentFile);
    var args = ["--timeout", config.timeout, config.testFile];
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