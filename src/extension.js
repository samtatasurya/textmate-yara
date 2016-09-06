"use strict";

const vscode = require("vscode");

// extension entry point - must be reachable by VSCode
export function activate() {
    console.log("inside yara.activate()");
}

// extension exit point - must be reachable by VSCode
export function deactivate() {
    console.log("inside yara.deactivate()");
}