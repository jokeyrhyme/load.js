// https://github.com/jrburke/requirejs/blob/d74e4f1d39/require.js ~ v2.1.17+

/**
* @license Available via the MIT or new BSD license.
*/

/*eslint-disable valid-jsdoc*/ // temporary
/*global importScripts*/ // WebWorker

'use strict';

var head, baseElement,
op = Object.prototype,
ostring = op.toString,
hasOwn = op.hasOwnProperty,
isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document),
isWebWorker = !isBrowser && typeof importScripts !== 'undefined',
//PS3 indicates loaded and complete, but need to wait for complete
//specifically. Sequence is 'loading', 'loaded', execution,
// then 'complete'. The UA check is unfortunate, but not sure how
//to feature test w/o causing perf issues.
readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ?
/^complete$/ : /^(complete|loaded)$/,
//Oh the tragedy, detecting opera. See the usage of isOpera for reason.
isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]';

function isFunction(it) {
  return ostring.call(it) === '[object Function]';
}

function isArray(it) {
  return ostring.call(it) === '[object Array]';
}

function hasProp(obj, prop) {
  return hasOwn.call(obj, prop);
}

/**
* Cycles over properties in an object and calls a function for each
* property value. If the function returns a truthy value, then the
* iteration is stopped.
*/
function eachProp(obj, func) {
  var prop;
  for (prop in obj) {
    if (hasProp(obj, prop)) {
      if (func(obj[prop], prop)) {
        break;
      }
    }
  }
}

/**
* Simple function to mix in properties from source into target,
* but only if target does not already have a property of the same name.
*/
function mixin(target, source, force, deepStringMixin) {
  if (source) {
    eachProp(source, function (value, prop) {
      if (force || !hasProp(target, prop)) {
        if (deepStringMixin && typeof value === 'object' && value &&
        !isArray(value) && !isFunction(value) &&
        !(value instanceof RegExp)) {

          if (!target[prop]) {
            target[prop] = {};
          }
          mixin(target[prop], value, force, deepStringMixin);
        } else {
          target[prop] = value;
        }
      }
    });
  }
  return target;
}

if (isBrowser) {
  head = document.getElementsByTagName('head')[0];
  //If BASE tag is in play, using appendChild is a problem for IE6.
  //When that browser dies, this can be removed. Details in this jQuery bug:
  //http://dev.jquery.com/ticket/2709
  baseElement = document.getElementsByTagName('base')[0];
  if (baseElement) {
    head = baseElement.parentNode;
  }
}

/**
* Creates the node for the load command. Only used in browser envs.
*/
function createNode() {
  // possibly support non-default namespace one day
  // var node = config.xhtml ?
  // document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
  var node = document.createElement('script');
  node.type = 'text/javascript';
  node.charset = 'utf-8';
  node.async = true;
  return node;
}

function removeListener(node, func, name, ieName) {
  //Favor detachEvent because of IE9
  //issue, see attachEvent/addEventListener comment elsewhere
  //in this file.
  if (node.detachEvent && !isOpera) {
    //Probably IE. If not it will throw an error, which will be
    //useful to know.
    if (ieName) {
      node.detachEvent(ieName, func);
    }
  } else {
    node.removeEventListener(name, func, false);
  }
}

/**
* Does the request to load a module for the browser case.
* Make this a separate function to allow other environments
* to override it.
*
* @param {Object} context the require context to find state.
* @param {String} moduleName the name of the module.
* @param {Object} url the URL to the module.
*/
function loadjs (url, callback) {
  var node;
  var onScriptLoad, onScriptError;

  var completeLoad = function (err, event) {
    if (node) {
      removeListener(node, onScriptLoad, 'load', 'onreadystatechange');
      removeListener(node, onScriptError, 'error');
    }
    if (callback && isFunction(callback)) {
      callback(err, event);
    }
  };

  onScriptLoad = function (evt) {
    //Using currentTarget instead of target for Firefox 2.0's sake. Not
    //all old browsers will be supported, but this one was easy enough
    //to support and still makes sense.
    if (
      evt.type === 'load' ||
      readyRegExp.test((evt.currentTarget || evt.srcElement).readyState)
    ) {
      completeLoad(null, evt);
    }
  };

  onScriptError = function (evt) {
    completeLoad(new Error('loadjs error: ' + url), evt);
  };

  if (isBrowser) {
    //In the browser so use a script tag
    node = createNode();

    //Set up load listener. Test attachEvent first because IE9 has
    //a subtle issue in its addEventListener and script onload firings
    //that do not match the behavior of all other browsers with
    //addEventListener support, which fire the onload event for a
    //script right after the script execution. See:
    //https://connect.microsoft.com/IE/feedback/details/648057/script-onload-event-is-not-fired-immediately-after-script-execution
    //UNFORTUNATELY Opera implements attachEvent but does not follow the script
    //script execution mode.
    if (
      node.attachEvent &&
      //Check if node.attachEvent is artificially added by custom script or
      //natively supported by browser
      //read https://github.com/jrburke/requirejs/issues/187
      //if we can NOT find [native code] then it must NOT natively supported.
      //in IE8, node.attachEvent does not have toString()
      //Note the test for "[native code" with no closing brace, see:
      //https://github.com/jrburke/requirejs/issues/273
      !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
      !isOpera
    ) {
      node.attachEvent('onreadystatechange', onScriptLoad);
      //It would be great to add an error handler here to catch
      //404s in IE9+. However, onreadystatechange will fire before
      //the error handler, so that does not help. If addEventListener
      //is used, then IE will fire error before load, but we cannot
      //use that pathway given the connect.microsoft.com issue
      //mentioned above about not doing the 'script execute,
      //then fire the script load event listener before execute
      //next script' that other browsers do.
      //Best hope: IE10 fixes the issues,
      //and then destroys all installs of IE 6-9.
      //node.attachEvent('onerror', onScriptError);
    } else {
      node.addEventListener('load', onScriptLoad, false);
      node.addEventListener('error', onScriptError, false);
    }
    node.src = url;

    if (baseElement) {
      head.insertBefore(node, baseElement);
    } else {
      head.appendChild(node);
    }

    return node;
  }
  if (isWebWorker) {
    try {
      //In a web worker, use importScripts. This is not a very
      //efficient use of importScripts, importScripts will block until
      //its script is downloaded and evaluated. However, if web workers
      //are in play, the expectation that a build has been done so that
      //only one script needs to be loaded anyway. This may need to be
      //reevaluated if other use cases become common.
      importScripts(url);

      //Account for anonymous modules
      completeLoad(null);
    } catch (e) {
      completeLoad(new Error('loadjs error: ' + url), null);
    }
  }
}

module.exports = loadjs;
