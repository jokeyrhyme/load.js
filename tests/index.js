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

  t.test('2x helloworld.js', function (tt) {
    var url = 'helloworld.js';
    var pending = 2;
    var done = function (err, event) {
      tt.error(err);
      tt.ok(event, 'callback with event');
      tt.ok(document.body.innerHTML.indexOf('hello, world!') !== -1);
      pending -= 1;
      if (pending === 0) {
        tt.end();
      }
    };
    loadjs(url, done);
    loadjs(url, done);
    tt.equal(document.querySelectorAll('script[src="' + url + '"]').length, 1);
  });

  t.test('2x missing.js', function (tt) {
    var url = 'missing.js';
    var pending = 2;
    var done = function (err, event) {
      if (err) {
        tt.ok(err instanceof Error, 'callback with error');
      } else {
        tt.ok(true);
      }
      tt.ok(event, 'callback with event');
      pending -= 1;
      if (pending === 0) {
        tt.end();
      }
    };
    loadjs(url, done);
    loadjs(url, done);
    tt.equal(document.querySelectorAll('script[src="' + url + '"]').length, 1);
  });

  t.test('2x badsyntax.js', function (tt) {
    var url = 'badsyntax.js';
    var pending = 2;
    var done = function (err, event) {
      if (err) {
        tt.ok(err instanceof Error, 'callback with error');
      } else {
        tt.ok(true);
      }
      tt.ok(event, 'callback with event');
      pending -= 1;
      if (pending === 0) {
        tt.end();
      }
    };
    loadjs(url, done);
    loadjs(url, done);
    tt.equal(document.querySelectorAll('script[src="' + url + '"]').length, 1);
  });

  t.end();
});
