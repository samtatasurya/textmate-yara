"use strict";

const cmd = require("child_process").spawn("cmd");
const vscode = require("vscode");
var config = vscode.workspace.getConfiguration("yara");

function cmd_compile_rule () {
    var filePath = config.installPath + "\\yarac64.exe";
    console.log("Compiling " + "${currentFile}" + " with " + filePath);
    // yarac64.exe ${RULES_FILE} ${OUTPUT_FILE}
}

function cmd_test_rule () {
    var filePath = config.installPath + "\\yara64.exe";
    console.log("Invoking " + filePath + " against " + "${currentFile}");
    // yara64.exe --timeout=${timeout} ${RULES_FILE} ${testFile}
}

// extension entry point - must be reachable by VSCode
function activate(context) {
    console.log("[*] Installing YARA extension's commands");
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