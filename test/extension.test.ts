"use strict";

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import * as yara from "../src/extension";

let workspace = path.join(__dirname, "..", "..", "test/rules/");

suite("YARA: Commands", () => {
    test("Compile Success", (done) => {
        let config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("yara");
        let filepath: string = path.join(workspace, "compile_success.yara");
        vscode.workspace.openTextDocument(filepath).then((doc) => {
            yara.compileRule(config, doc).then((diagnostics: vscode.Diagnostic[]) => {
                let count: number = diagnostics.length;
                console.log(`Found ${count} diagnostics. 0 expected`);
                assert.equal(count, 0, `Found ${count} diagnostics. 0 expected`);
                done();
            }).catch((err) => {
                console.log(`[CompileSuccessError] ${err}`);
                assert.ok(false, `Error in CompileSuccess: ${err}`);
            });
        });
    });

    test("Compile Fail", (done) => {
        let config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("yara");
        let filepath: string = path.join(workspace, "compile_fail.yara");
        vscode.workspace.openTextDocument(filepath).then((doc) => {
            yara.compileRule(config, doc).then((diagnostics: vscode.Diagnostic[]) => {
                let count: number = 0;
                for (var i = 0; i < diagnostics.length; i++) {
                    let d: vscode.Diagnostic = diagnostics[i];
                    if (d.severity == vscode.DiagnosticSeverity.Error) { count++; }
                }
                console.log(`Found ${count} errors. 2 expected`);
                assert.equal(count, 2, `Found ${count} errors. 2 expected`);
                done();
            }).catch((err) => {
                console.log(`[CompileFailError] ${err}`);
                assert.ok(false, `Error in CompileFail: ${err}`);
            });
        });
    });

    test("Compile Warning", (done) => {
        let config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("yara");
        let filepath: string = path.join(workspace, "compile_warning.yara");
        vscode.workspace.openTextDocument(filepath).then((doc) => {
            yara.compileRule(config, doc).then((diagnostics: vscode.Diagnostic[]) => {
                let count: number = 0;
                for (var i = 0; i < diagnostics.length; i++) {
                    let d: vscode.Diagnostic = diagnostics[i];
                    if (d.severity == vscode.DiagnosticSeverity.Warning) { count++; }
                }
                console.log(`Found ${count} warnings. 1 expected`);
                assert.equal(count, 1, `Found ${count} warnings. 1 expected`);
                done();
            }).catch((err) => {
                console.log(`[CompileWarningError] ${err}`);
                assert.ok(false, `Error in CompileWarning: ${err}`);
            });
        });
    });
});

/*
    Scenarios that still need tests
    * installPath:
        * User-defined installPath must override default YARA binaries set in $PATH
        * If no installPath given or installPath is null:
            * Assume YARA is in $PATH
        * If installPath doesn't lead to YARA binaries, do three things:
            * Unregister command(s) from VSCode
            * Set compileOnSave to false
            * Warn user and present options: "OK" and "Don't Show Again"
    * compileOnSave
        * Only YARA files get compiled on saves (e.g. no need to attempt JSON files)
    * compileFlags
        * If an improper flag is given, warn user and abort compilation
        * Change flags being run as soon as user changes setting - don't force window reload
    * warnings.yara
        * Push 1 diagnostic with severity = warning AND set statusbarmessage to "Compiled successfully"
*/
