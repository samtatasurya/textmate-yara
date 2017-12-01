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
    setup(function() {
        let ext = vscode.extensions.getExtension("infosec-intern.yara");
        // output doesn't matter. only that the extension is activated
        ext.activate();
    });
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
    test("command registration", function(done) {
        // Only register commands when the "commands" value is true
        let ext = vscode.extensions.getExtension("infosec-intern.yara");
        ext.activate();
    });
    test("installPath override", function(done) {
        // User-defined installPath must override default YARA binaries set in $PATH
        let ext = vscode.extensions.getExtension("infosec-intern.yara");
        ext.activate();
    });
    test("installPath empty", function(done) {
        // If no installPath given or installPath is null assume YARA is in $PATH
        let ext = vscode.extensions.getExtension("infosec-intern.yara");
        ext.activate();
    });
    test("installPath no-binaries", function(done) {
        // If installPath doesn't lead to YARA binaries, do three things:
        //  * Unregister command(s) from VSCode
        //  * Set compileOnSave to false
        //  * Warn user and present options: "OK" and "Don't Show Again"
        let ext = vscode.extensions.getExtension("infosec-intern.yara");
        ext.activate();
    });
    test("compileOnSave only YARA", function(done) {
        // Only YARA files get compiled on saves (e.g. no need to attempt JSON files)
        let ext = vscode.extensions.getExtension("infosec-intern.yara");
        ext.activate();
    });
    test("compileFlags improper flag", function(done) {
        // If an improper flag is given, warn user and abort compilation
        let ext = vscode.extensions.getExtension("infosec-intern.yara");
        ext.activate();
    });
    test("compileFlags change on-demand", function(done) {
        // Change flags being run as soon as user changes setting - don't force window reload
        let ext = vscode.extensions.getExtension("infosec-intern.yara");
        ext.activate();
    });
});
