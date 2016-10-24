"use strict";

const vscode = require("vscode");

// extension entry point - must be reachable by VSCode
function activate(context) {
    console.log("[*] Installing YARA extension's commands");
    vscode.commands.registerCommand("yara.ShowMessage", function () {
        vscode.window.showInformationMessage("Hello World!");
    });
}
exports.activate = activate;

// extension exit point - must be reachable by VSCode
function deactivate() {
    console.log("[*] Uninstalling YARA commands");
}
exports.deactivate = deactivate;