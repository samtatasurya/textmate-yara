"use strict";

import * as vscode from "vscode";
import ext = require("./yara");


function activate(context: vscode.ExtensionContext) {
    console.log("[*] Installing the YARA extension")
    // Create our YARA object to do everything with
    let yara = new ext.Yara();
    // Registering our simple commands to call here
    let compile = vscode.commands.registerCommand("yara.CompileRule", yara.compileRules);
    // Dispose of our objects later
    context.subscriptions.push(yara);
    context.subscriptions.push(compile);
}

function deactivate(context: vscode.ExtensionContext) {
    console.log("[*] Uninstalling the YARA extension")
}


exports.activate = activate
exports.deactivate = deactivate