"use strict";

const cmd = require("child_process");
const vscode = require("vscode");
var config = vscode.workspace.getConfiguration("yara");

function cmd_compile_rule () {
    var yaracPath = config.installPath + "\\yarac64.exe";
    var currentFile = vscode.workspace.textDocuments[0].filename;
    console.log("Compiling " + currentFile + " with " + yaracPath);
    // yarac64.exe ${RULES_FILE} ${OUTPUT_FILE}
    var args = [".\test.yara"];
    console.log("[**] yaracProcess = cmd.spawn('" + yaracPath + "', '" + args + "');");
    var yaracProcess = cmd.spawn(yaracPath, args);
}

function cmd_test_rule () {
    var yaraPath = config.installPath + "\\yara64.exe";
    var currentFile = vscode.workspace.textDocuments[0].filename;
    console.log("Invoking " + yaraPath + " against " + currentFile);
    // yara64.exe --timeout=${timeout} ${RULES_FILE} ${testFile}
    var args = ["--timeout", config.timeout, config.testFile];
    console.log("[**] yaraProcess = cmd.spawn('" + yaraPath + "', '" + args + "');");
    var yaraProcess = cmd.spawn(yaraPath, args);
}

// extension entry point - must be reachable by VSCode
function activate(context) {
    console.log("[*] Installing YARA extension's commands");
//    console.log("currentFile: " + JSON.stringify(vscode.workspace.textDocuments));
    if (config.installPath != null) {
        vscode.commands.registerCommand("yara.CompileRule", cmd_compile_rule);
        vscode.commands.registerCommand("yara.TestRule", cmd_test_rule);
    }
    else {
        console.log("[*] No YARA install found!");
        var disposable = vscode.window.showErrorMessage("No YARA installation folder specified!");
    }
}
exports.activate = activate;

// extension exit point - must be reachable by VSCode
function deactivate() {
    console.log("[*] Uninstalling YARA commands");
}
exports.deactivate = deactivate;