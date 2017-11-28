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

suite("YARA: Commands", function() {
    // before("Set test state", function() {
    //     let config = vscode.workspace.getConfiguration("yara");
    //     if (config.get("commands")) {
    //         // should match null and undefined
    //         if (config.get("installPath") != null) {
    //             let installPath: string = config.get("installPath");
    //             console.log(`Setting compiler path to ${installPath}`);
    //             // yara.yarac = path.join(installPath, "yarac");
    //         }
    //         else {
    //             // assume YARA binaries are in user's PATH. If not, we'll handle errors later
    //             // yara.yarac = "yarac";
    //             console.log("No compiler install path found. Assuming compiler is available in $PATH");
    //         }
    //     }
    // });

    test("Compile Success", function(done) {
        let config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("yara");
        let filepath: string = path.join(workspace, "compile_success.yara");
        vscode.workspace.openTextDocument(filepath).then(function(doc) {
            yara.compileRule(config, doc).then(function(diagnostics: vscode.Diagnostic[]) {
                let count: number = diagnostics.length;
                console.log(`Found ${count} diagnostics. 0 expected`);
                assert.equal(count, 0, `Found ${count} diagnostics. 0 expected`);
                done();
            }).catch(function(err) {
                console.log(`[CompileSuccessError] ${err}`);
                assert.ok(false, `Error in CompileSuccess: ${err}`);
            });
        });
    });

    test("Compile Fail", function(done) {
        let config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("yara");
        let filepath: string = path.join(workspace, "compile_fail.yara");
        vscode.workspace.openTextDocument(filepath).then(function(doc) {
            yara.compileRule(config, doc).then(function(diagnostics: vscode.Diagnostic[]) {
                let count: number = 0;
                for (var i = 0; i < diagnostics.length; i++) {
                    let d: vscode.Diagnostic = diagnostics[i];
                    if (d.severity == vscode.DiagnosticSeverity.Error) { count++; }
                }
                console.log(`Found ${count} errors. 2 expected`);
                assert.equal(count, 2, `Found ${count} errors. 2 expected`);
                done();
            }).catch(function(err) {
                console.log(`[CompileFailError] ${err}`);
                assert.ok(false, `Error in CompileFail: ${err}`);
            });
        });
    });

    test("Compile Warning", function(done) {
        let config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("yara");
        let filepath: string = path.join(workspace, "compile_warning.yara");
        vscode.workspace.openTextDocument(filepath).then(function(doc) {
            yara.compileRule(config, doc).then(function(diagnostics: vscode.Diagnostic[]) {
                let count: number = 0;
                for (var i = 0; i < diagnostics.length; i++) {
                    let d: vscode.Diagnostic = diagnostics[i];
                    if (d.severity == vscode.DiagnosticSeverity.Warning) { count++; }
                }
                console.log(`Found ${count} warnings. 1 expected`);
                assert.equal(count, 1, `Found ${count} warnings. 1 expected`);
                done();
            }).catch(function(err) {
                console.log(`[CompileWarningError] ${err}`);
                assert.ok(false, `Error in CompileWarning: ${err}`);
            });
        });
    });
});

suite.skip("YARA: Configuration", function() {
    test("installPath", function(done) {});
    test("compileOnSave", function(done) {});
    test("compileFlags", function(done) {});
    test("commands", function(done) {});
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
*/
