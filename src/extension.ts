"use strict";

import * as vscode from "vscode";
import * as ext from "./yara";

exports.activate = function(context: vscode.ExtensionContext) {
    console.log("Activating Yara extension");
    let yara = new ext.Yara();
    // Dispose of our objects later
    context.subscriptions.push(yara);
};
exports.deactivate = function(context: vscode.ExtensionContext) {
    console.log("Deactivating Yara extension");
    console.log(context.subscriptions.values());
};
