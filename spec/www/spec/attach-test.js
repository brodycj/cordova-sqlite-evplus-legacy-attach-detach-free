/* 'use strict'; */

var MYTIMEOUT = 12000;

var DEFAULT_SIZE = 5000000; // max to avoid popup in safari/ios

var isAndroid = /Android/.test(navigator.userAgent);
var isWindows = /Windows /.test(navigator.userAgent); // Windows (8.1)

// NOTE: ATTACH not yet implemented for default Android-sqlite-connector db implementation
//var pluginScenarioList = [ isAndroid ? 'Plugin-xx-default' : 'Plugin', 'Plugin-xx-2' ];
var pluginScenarioList = [ isAndroid ? 'Plugin-android.database' : 'Plugin' ];

var pluginScenarioCount = 1;
// FUTURE:
//var pluginScenarioCount = isAndroid ? 2 : 1;

var mytests = function() {

  for (var i=0; i<pluginScenarioCount; ++i) {

    describe(pluginScenarioList[i] + ': ATTACH/DETACH test(s)', function() {
      var scenarioName = pluginScenarioList[i];
      var suiteName = scenarioName + ': ';

      var isImpl2 = true;
      // FUTURE:
      //var isImpl2 = (i === 1);

      it(suiteName + 'preliminary cleanup 1',
        function(done) {
          expect(true).toBe(true);
          window.sqlitePlugin.deleteDatabase('attach-test-external.db', done, done);
        }, MYTIMEOUT);

      it(suiteName + 'preliminary cleanup 2',
        function(done) {
          expect(true).toBe(true);
          window.sqlitePlugin.deleteDatabase('attach-test.db', done, done);
        }, MYTIMEOUT);

      it(suiteName + 'ATTACH/PRAGMA database_list/DETACH test',
        function(done) {
          if (isWindows) pending('NOT IMPLEMENTED for Windows'); // FUTURE TBD

          window.sqlitePlugin.openDatabase({
            name: 'attach-test-external.db',
            androidDatabaseImplementation: isImpl2 ? 2 : 0
          }, function(db1) {
          db1.transaction(function(tx) {
            tx.executeSql('DROP TABLE IF EXISTS tt');
            tx.executeSql('CREATE TABLE tt (tv TEXT)');
            tx.executeSql('INSERT INTO tt VALUES (?)', ['test']);
          }, function(err) {
            expect(false).toBe(true);
            done();
          }, function() {

            db1.close(function() {

              window.sqlitePlugin.openDatabase({
                name: 'attach-test.db',
                androidDatabaseImplementation: isImpl2 ? 2 : 0
              }, function(db2) {
                db2.attach('ext_attached', 'attach-test-external.db', function() {
                  db2.executeSql('SELECT * from ext_attached.tt', [], function(res) {
                    expect(res).toBeDefined();
                    expect(res.rows).toBeDefined();
                    expect(res.rows.length).toBe(1);
                    expect(res.rows.item(0).tv).toBeDefined();
                    expect(res.rows.item(0).tv).toBe('test');

                    db2.executeSql('PRAGMA database_list', [], function(res) {
                      expect(res.rows.length).toBe(2);
                      expect(res.rows.item(0).name).toBe('main');
                      expect(res.rows.item(1).name).toBe('ext_attached');
                      expect(res.rows.item(1).file).toBeDefined();
                      expect(res.rows.item(1).file.indexOf('attach-test-external.db') >= 0).toBe(true);

                      db2.detach('ext_attached', function() {
                        db2.executeSql('PRAGMA database_list', [], function(res) {
                          expect(res.rows.length).toBe(1);
                          expect(res.rows.item(0).name).toBe('main');

                          done();
                        }, function(err) {
                          expect(false).toBe(true);
                          expect(JSON.stringify(err)).toBe('');
                          done();
                        });
                      }, function(err) {
                        expect(false).toBe(true);
                        expect(JSON.stringify(err)).toBe('');
                        done();
                      });
                    }, function(err) {
                      expect(false).toBe(true);
                      expect(JSON.stringify(err)).toBe('');
                      done();
                    });
                  }, function(err) {
                    expect(false).toBe(true);
                    expect(JSON.stringify(err)).toBe('');
                    done();
                  });
                }, function(err) {
                  expect(false).toBe(true);
                  done();
                });
              });
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
