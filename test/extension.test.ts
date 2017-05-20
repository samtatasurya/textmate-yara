//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import * as ext from "../src/yara";

let config = vscode.workspace.getConfiguration("yara");
let workspace = path.join(__dirname, "..", "..", "test/rules/");

// set yara.installPath setting
config.update("installPath", "%APPDATA%\\Yara", true);

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
                console.log(err);
            });
        });
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

// unset yara.installPath setting
config.update("installPath", undefined, true);
suite("YARA: Settings", function() {
//     test("No Warnings Enabled", function(done) {
//         let yara = new ext.Yara();
//         let filepath = path.join(__dirname, "..", "..", "test/rules/warning.yara");
//         // set the --no-warning flag and check if warnings are present
//         vscode.workspace.openTextDocument(filepath).then(function(document) {
//             const promise = yara.compileRule(document);
//             promise.then(function(diagnostics) {
//                 let count:number = 0;
//                 for (var i in diagnostics) {
//                     // Diagnostic Severity of 1 == Warning
//                     assert.equal(diagnostics[i].severity, 1);
//                 }
//                 done();
//             }).catch(function(err) {
//                 console.log(err);
//             });
//         });
//     });
//
//     test("Unknown Option Flag", function(done) {
//         let yara = new ext.Yara();
//         done();
//     });
//
    test("Install Path", function(done) {
        let yara = new ext.Yara();
        done();
    });
});