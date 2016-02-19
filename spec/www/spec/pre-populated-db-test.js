/* 'use strict'; */

var MYTIMEOUT = 12000;

var DEFAULT_SIZE = 5000000; // max to avoid popup in safari/ios

// FUTURE TODO replace in test(s):
function ok(test, desc) { expect(test).toBe(true); }
function equal(a, b, desc) { expect(a).toEqual(b); } // '=='
function strictEqual(a, b, desc) { expect(a).toBe(b); } // '==='

var isAndroid = /Android/.test(navigator.userAgent);
var isWP8 = /IEMobile/.test(navigator.userAgent); // Matches WP(7/8/8.1)
var isWindows = /Windows /.test(navigator.userAgent); // Windows (8.1)
var isIE = isWindows || isWP8;

var pluginScenarioList = [ isAndroid ? 'Plugin-xx-default' : 'Plugin', 'Plugin-xx-2' ];

var pluginScenarioCount = isAndroid ? 2 : 1;

// simple tests:
var mytests = function() {

  for (var i=0; i<pluginScenarioCount; ++i) {

    describe(pluginScenarioList[i] + ': pre-populated test(s)', function() {
      var scenarioName = pluginScenarioList[i];
      var suiteName = scenarioName + ': ';
      var isOldDatabaseImpl = (i === 1);

      it(suiteName + 'preliminary cleanup',
        function(done) {
          expect(true).toBe(true);
          window.sqlitePlugin.deleteDatabase('pre.db', done, done);
        }, MYTIMEOUT);

      it(suiteName + 'Pre-populated database test',
        function(done) {
          var dbc1 = window.sqlitePlugin.openDatabase({
            name: 'pre.db',
            createFromLocation: 1,
            androidDatabaseImplementation: isOldDatabaseImpl ? 2 : 0
          });

          expect(dbc1).toBeDefined()

          var check1 = false;

          dbc1.transaction(function(tx) {

            expect(tx).toBeDefined()

            tx.executeSql('SELECT * from tt', [], function(tx, res) {
              expect(res.rows.item(0).testcol).toEqual('Test-Value');
              check1 = true;

              // try some changes:
              tx.executeSql('DELETE FROM tt');
              tx.executeSql('INSERT INTO tt VALUES (?)', ['new-value']);
            });
          }, function(e) {
            expect(false).toBe(true);
            dbc1.close();
            done();
          }, function() {
            expect(check1).toBe(true);
            dbc1.close(function() {
              // try opening it again:
              var dbc2 = window.sqlitePlugin.openDatabase({
                name: 'pre.db',
                createFromLocation: 1,
                androidDatabaseImplementation: isOldDatabaseImpl ? 2 : 0
              });

              var check2 = false;

              dbc2.transaction(function(tx) {
                expect(tx).toBeDefined()

                // verify that the changes were not overwritten:
                tx.executeSql('SELECT * from tt', [], function(tx, res) {
                  expect(res.rows.item(0).testcol).toEqual('new-value');
                  check2 = true;
                });
              }, function(e) {
                expect(false).toBe(true);
                dbc2.close();
                done();
              }, function() {
                expect(check2).toBe(true);
                dbc2.close();
                done();
              });
            });
          });
        }, MYTIMEOUT);

      it(suiteName + 'preliminary blob test cleanup',
        function(done) {
          expect(true).toBe(true);
          window.sqlitePlugin.deleteDatabase('blob-pre.db', done, done);
        }, MYTIMEOUT);

      it(suiteName + 'Pre-populated blob database test', function(done) {
          if (isAndroid && !isOldDatabaseImpl) pending('BROKEN for default Android-sqlite-connector version'); // XXX

          var dbc1 = window.sqlitePlugin.openDatabase({
            name: 'blob-pre.db',
            createFromLocation: 1,
            androidDatabaseImplementation: isOldDatabaseImpl ? 2 : 0
          });

          expect(dbc1).toBeDefined()

          var check1 = false;

          dbc1.transaction(function(tx) {

            expect(tx).toBeDefined();

            tx.executeSql('SELECT * from tt', [], function(tx, res) {
              // XXX TBD: Why does android.database.sqlite add the extra '\n' character???
              //expect(res.rows.item(0).blobcol).toEqual('AQID');

              if (isAndroid)
                expect(res.rows.item(0).blobcol).toEqual('AQID\n');
              else
                expect(res.rows.item(0).blobcol).toEqual('AQID');

              check1 = true;

              // try some changes:
              tx.executeSql('DELETE FROM tt');
              tx.executeSql('INSERT INTO tt VALUES (?)', ['string-value']);
            });
          }, function(e) {
            expect(false).toBe(true);
            dbc1.close();
            done();
          }, function() {
            expect(check1).toBe(true);
            dbc1.close(function() {
              // try opening it again:
              var dbc2 = window.sqlitePlugin.openDatabase({
                name: 'blob-pre.db',
                createFromLocation: 1,
                androidDatabaseImplementation: isOldDatabaseImpl ? 2 : 0
              });

              var check2 = false;

              dbc2.transaction(function(tx) {
                expect(tx).toBeDefined()

                // verify that the changes were not overwritten:
                tx.executeSql('SELECT * from tt', [], function(tx, res) {
                  expect(res.rows.item(0).blobcol).toEqual('string-value');
                  check2 = true;
                });
              }, function(e) {
                expect(false).toBe(true);
                dbc2.close();
                done();
              }, function() {
                expect(check2).toBe(true);
                dbc2.close();
                done();
              });
            });
          });
        }, MYTIMEOUT);


    });
  };
}

if (window.hasBrowser) mytests();
else exports.defineAutoTests = mytests;

/* vim: set expandtab : */
