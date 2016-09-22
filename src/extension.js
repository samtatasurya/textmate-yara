"use strict";

// taken from js-beautify extension for VSCode
// --------------------------------------------
const vscode = require("vscode");
const dumpError = e => {
	if (e) console.log('yara err:', e);
};
// --------------------------------------------

// extension entry point - must be reachable by VSCode
function activate() {
    console.log("inside yara.activate()");
}

// extension exit point - must be reachable by VSCode
function deactivate() {
    console.log("inside yara.deactivate()");
}