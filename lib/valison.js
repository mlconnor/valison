/*
 * valison
 * https://github.com/mlconnor/valison
 *
 * Copyright (c) 2014 Michael Connor
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var validator = require('validator');
/*
{
  "firstName":{
    "trim":[],
    "isLength":[1,20]
  },
  "address.addressLine1" : {
    "isNull":[],
    "isLength":[5,10]
  }
}
*/

var validationFns = { sanitizers : {}, validators : {} };

/* add all validator functions */
_.each([
  "equals",
  "contains",
  "matches",
  "isEmail",
  "isURL",
  "isIP",
  "isAlpha",
  "isNumeric",
  "isAlphanumeric",
  "isBase64",
  "isHexadecimal",
  "isHexColor",
  "isLowercase",
  "isUppercase",
  "isInt",
  "isFloat",
  "isDivisibleBy",
  "isNull",
  "isLength",
  "isByteLength",
  "isUUID",
  "isDate",
  "isAfter",
  "isBefore",
  "isIn",
  "isCreditCard",
  "isISBN",
  "isJSON",
  "isMultibyte",
  "isAscii",
  "isFullWidth",
  "isHalfWidth",
  "isVariableWidth",
  "isSurrogatePair"],
function(fnName) {
  validationFns.validators[fnName] = validator;
});

_.each([
  "toString",
  "toDate",
  "toFloat",
  "toInt",
  "toBoolean",
  "trim",
  "ltrim",
  "rtrim",
  "escape",
  "stripLow",
  "whitelist",
  "blacklist"],
function(fnName) {
  validationFns.sanitizers[fnName] = validator;
});

/* add lodash validators */
_.each([
  "has",
  "isArguments",
  "isArray",
  "isBoolean",
  "isDate",
  "isElement",
  "isEmpty",
  "isEqual",
  "isFinite",
  "isFunction",
  "isNaN",
  "isNull",
  "isNumber",
  "isObject",
  "isPlainObject",
  "isRegExp",
  "isString",
  "isUndefined"
], function(fnName) {
  validationFns.validators[fnName] = _;
});

//console.log(JSON.stringify(validationFns,null,'  '));

/**
 * Add an entire library or specific function
 * from a library given its name.
 */
/*
exports.addLibrary = function(lib, fnName) {
  if ( fnName ) {
    validationFunctions[fnName] = lib;
  } else { 
    _.each(lib, function(def, fn) {
      if ( _.isFunction(def) ) {
        validationFunctions[fn] = lib;
      }
    });
  }
};
*/
//exports.addLibrary(validator);
//exports.addLibrary(_);

// Get/set the value of a nested property
function deep(obj, key, value) {
 
  var keys = key.replace(/\[(["']?)([^\1]+?)\1?\]/g, '.$2').replace(/^\./, '').split('.'),
  root,
  i = 0,
  n = keys.length;
 
  // Set deep value
  if (arguments.length > 2) {
    root = obj;
    n--;
 
    while (i < n) {
      key = keys[i++];
      obj = obj[key] = _.isObject(obj[key]) ? obj[key] : {};
    }
 
    obj[keys[i]] = value;
 
    value = root;
  // Get deep value
  } else {
    while ((obj = obj[keys[i++]]) != null && i < n) {}
    value = i < n ? void 0 : obj;
  }
 
  return value;
}

//exports.addFn = function(library, fn) {
//  validationFunctions[fn] = library;
//};

/**
 * validates the definition with the
 * provided value.  If an value passes
 * all tests then it will be set to the
 * result from the filters.  Otherwise,
 * it will be left alone.
 */
exports.validate = function(def, val) {
  /*console.log('validate called with', arguments); */
  var issues = {};

  _.each(def, function(validations, path) {
    var valueAtPath = deep(val, path);
    var valid = true;

    for ( var i = 0; i < validations.length && valid; i++ ) {
      var validationSet =  _.isArray(validations[i]) ? validations[i] : [ validations[i] ];
      var validationName = validationSet[0];
      var validationMsg = validationSet.length > 1 ? validationSet[1] : null;
      /*console.log("Val at path=" + path, valueAtPath);*/
      /*console.log("\npath=" + path + " val=" + valueAtPath + " running " + validationName);*/

      var fnName = validationName.replace(/\s/g, '');
      var sanitizer = false;
      var inverted = false;
      if ( fnName.charAt(0) === '!' ) {
        fnName = fnName.substring(1);
        inverted = true;
      }
      sanitizer = _.has(validationFns.sanitizers, fnName);  
      
      var validationArgs = sanitizer ? validationSet.slice(1) : validationSet.length > 2 ? validationSet.slice(2) : [];

      /*console.log('fnName=' + fnName + ", sanitizer?=" + sanitizer + ' inverted=' + inverted);*/
      var lib = sanitizer ? validationFns.sanitizers[fnName] : validationFns.validators[fnName];
      if ( typeof lib === 'undefined' ) {
        throw "function [" + fnName + "] not registered XXXXXXXXXXX";
      }
      var fn = lib[fnName];
      var fnArgs = validationArgs.slice(0);
      fnArgs.unshift(valueAtPath);
      var result = fn.apply(null, fnArgs);
      /*console.log("  result=", result);*/

      if ( sanitizer ) {
        /* this is a filter so let's just set the value */
        /* console.log('  setting path ' + path + ' to value [' + result + '] context', val); */
        /* deep(val, path, result); */
        valueAtPath = result;
      } else {
        /*console.log('  ' + path + ':' + validationName + ' result=' + result + " inverted=" + inverted);*/
        /* if normal, valid == true, if inverted, valid == false */
        if ( result === inverted ) {
          issues[path] = validationMsg ? validationMsg : validationName;
          /*console.log('  stopping validation due to invalid');*/
          valid = false;
        }
      }
    }

    /* if the result was valid then we will reset the value in the original object. */
    if ( valid ) {
      deep(val, path, valueAtPath);
    }
  });
  /*console.log("RETURN ISSUES", issues);*/
  return issues;
};



