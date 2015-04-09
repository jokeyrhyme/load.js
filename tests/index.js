'use strict';

// 3rd-party modules

/*eslint-disable vars-on-top*/ // need to fix console first

// jumping through hoops for IE6,7,8
if (typeof global !== 'undefined') {
  if (!global.console || !global.console.log) {
    global.console = require('console');
  }
}
var test = require('tape');

// our modules

var loadjs = require('../loadjs');

// this module

test('loadjs', function (t) {
  t.ok(loadjs, 'loadjs module');
  t.ok(typeof loadjs === 'function', 'exports a function');

  if (!process.browser) {
    t.end();
    return;
  }

  t.test('helloworld.js', function (tt) {
    loadjs('helloworld.js', function (err, event) {
      tt.error(err);
      tt.ok(event, 'callback with event');
      tt.ok(document.body.innerHTML.indexOf('hello, world!') !== -1);
      tt.end();
    });
  });

  t.test('missing.js', function (tt) {
    loadjs('missing.js', function (err, event) {
      if (err) {
        tt.ok(err instanceof Error, 'callback with error');
      } else {
        tt.ok(true);
      }
      tt.ok(event, 'callback with event');
      tt.end();
    });
  });

  t.test('badsyntax.js', function (tt) {
    loadjs('badsyntax.js', function (err, event) {
      if (err) {
        tt.ok(err instanceof Error, 'callback with error');
      } else {
        tt.ok(true);
      }
      tt.ok(event, 'callback with event');
      tt.end();
    });
  });

  t.end();
});
