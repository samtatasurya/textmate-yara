"use strict";

const vscode = require("vscode");

// extension entry point - must be reachable by VSCode
function activate(context) {
    console.log("[*] Installing YARA extension's commands");
    var config = vscode.workspace.getConfiguration('yara');
    if (config.installPath != null) {
/*
        if (!String(config.installPath).endswith("/")) {
            config.installPath.concat("/");
        }
*/
        console.log("[*] YARA is installed in "+ config.installPath)
        vscode.commands.registerCommand("yara.CompileRule", function () {
            vscode.window.showInformationMessage("Compiling " + "${currentFile}" + " with " + String(config.installPath) + "yarac64.exe");
        });
        vscode.commands.registerCommand("yara.TestRule", function() {
            vscode.window.showInformationMessage("Invoking " + String(config.installPath) + "yara64.exe against " + "${currentFile}");
        });
    }
    else {
        console.log("[*] No YARA install found!");
        vscode.window.showErrorMessage("No YARA installation folder specified!");
    }
}
exports.activate = activate;

// extension exit point - must be reachable by VSCode
function deactivate() {
    console.log("[*] Uninstalling YARA commands");
}
exports.deactivate = deactivate;