//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import * as ext from "../src/yara";

let workspace = path.join(__dirname, "..", "..", "test/rules/");

suite("YARA: Commands", function() {
    test("Compile Success", function(done) {
        let yara = new ext.Yara();
        let filepath = path.join(workspace, "compile_success.yara");
        vscode.workspace.openTextDocument(filepath).then(function(document) {
            const promise = yara.compileRule(document);
            promise.then(function(diagnostics) {
                let count:number = 0;
                for (var i in diagnostics) { count++; }
                assert.equal(count, 0, `Found ${count} errors. 0 expected`);
                done();
            }).catch(function(err) {
                console.log(err);
            });
        });
    });

    test("Compile Fail", function(done) {
        let yara = new ext.Yara();
        let filepath = path.join(workspace, "compile_fail.yara");
        vscode.workspace.openTextDocument(filepath).then(function(document) {
            const promise = yara.compileRule(document);
            promise.then(function(diagnostics) {
                let count:number = 0;
                for (var i in diagnostics) { count++; }
                assert.equal(count, 2, `Found ${count} errors. 2 expected`);
                done();
            }).catch(function(err) {
                assert.ok(false, `Error in CompileFail: ${err}`);
            });
        });
    });

    test("Warning", function(done) {

    });

    // test("Execute", function(done) {
    //     let yara = new ext.Yara();
    //     let filepath = path.join(workspace, "execute.yara");
    //     vscode.workspace.openTextDocument(filepath).then(function(document) {
    //             const promise = yara.executeRule(document);
    //             promise.then(function(diagnostics) {
    //                 let count:number = 0;
    //                 for (var i in diagnostics) { count++; }
    //                 assert.equal(count, 0, `Found ${count} errors. 0 expected`);
    //                 done();
    //             }).catch(function(err) {
    //                 console.log(err);
    //         });
    //     });
    // });
});

/*
    Scenarios that still need tests
    * installPath:
        * User-defined installPath must override default YARA binaries set in $PATH
        * If no installPath given or installPath doesn't lead to YARA binaries, do three things:
            * Unregister command(s) from VSCode
            * Set compileOnSave to false
            * Warn user and present options: "OK" and "Don't Show Again"
    * target:
        * If no target is given, unregister ExecuteRule command
        * If target is improper, warn user and present options: "OK" and "Don't Show Again"
    * compileOnSave
        * Only YARA files get compiled on saves (e.g. no need to attempt JSON files)
    * compileFlags
        * If an improper flag is given, warn user and abort compilation
        * Change flags being run as soon as user changes setting - don't force window reload
*/
