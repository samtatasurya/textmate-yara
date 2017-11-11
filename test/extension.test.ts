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
            yara.compileRule(config, doc).then((diagnostics) => {
                let count: number = 0;
                for (var i in diagnostics) { count++; }
                console.log(`Found ${count} errors. 0 expected`);
                assert.equal(count, 0, `Found ${count} errors. 0 expected`);
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
            yara.compileRule(config, doc).then((diagnostics) => {
                let count: number = 0;
                for (var i in diagnostics) { count++; }
                console.log(`Found ${count} errors. 2 expected`);
                assert.equal(count, 2, `Found ${count} errors. 2 expected`);
                done();
            }).catch((err) => {
                console.log(`[CompileFailError] ${err}`);
                assert.ok(false, `Error in CompileFail: ${err}`);
            });
        });
    });
});

/*
    Scenarios that still need tests
    * installPath:
        * User-defined installPath must override default YARA binaries set in $PATH
        * If no installPath given or installPath doesn't lead to YARA binaries, do three things:
            * Unregister command(s) from VSCode
            * Set compileOnSave to false
            * Warn user and present options: "OK" and "Don't Show Again"
        * Don't assume user has 'yara.exe' or 'yarac.exe'
    * compileOnSave
        * Only YARA files get compiled on saves (e.g. no need to attempt JSON files)
    * compileFlags
        * If an improper flag is given, warn user and abort compilation
        * Change flags being run as soon as user changes setting - don't force window reload
    * warnings.yara
        * Push 1 diagnostic with severity = warning AND set statusbarmessage to "Compiled successfully"
*/
