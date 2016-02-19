/* 'use strict'; */

var MYTIMEOUT = 12000;

var DEFAULT_SIZE = 5000000; // max to avoid popup in safari/ios

var isAndroid = /Android/.test(navigator.userAgent);
var isWindows = /Windows /.test(navigator.userAgent); // Windows (8.1)

//var scenarioList = [ isAndroid ? 'Plugin-sqlite-connector' : 'Plugin', 'HTML5', 'Plugin-android.database' ];
var scenarioList = [ isAndroid ? 'Plugin-android.database' : 'Plugin' ];

//var scenarioCount = isAndroid ? 3 : (isIE ? 1 : 2);
var scenarioCount = 1;

// simple tests:
var mytests = function() {

  for (var i=0; i<scenarioCount; ++i) {

    describe(scenarioList[i] + ': ATTACH (TBD: DETACH) test(s)', function() {
      var scenarioName = scenarioList[i];
      var suiteName = scenarioName + ': ';
      var isWebSql = (i === 1);
      var isOldImpl = (i === 2);

      // NOTE: MUST be defined in function scope, NOT outer scope:
      var openDatabase = function(name, ignored1, ignored2, ignored3) {
        if (isOldImpl) {
          return window.sqlitePlugin.openDatabase({name: name, androidDatabaseImplementation: 2});
        }
        if (isWebSql) {
          return window.openDatabase(name, "1.0", "Demo", DEFAULT_SIZE);
        } else {
          return window.sqlitePlugin.openDatabase(name, "1.0", "Demo", DEFAULT_SIZE);
        }
      }

      it(suiteName + 'Simple attach test',
        function(done) {
          if (isWebSql && !isAndroid) pending('BROKEN for iOS Web SQL');
          if (isWindows) pending('BROKEN for Windows ("Universal")');

          window.sqlitePlugin.openDatabase({
            name: 'attach-test-external.db',
            androidDatabaseImplementation: 2,
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
                androidDatabaseImplementation: 2,
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
