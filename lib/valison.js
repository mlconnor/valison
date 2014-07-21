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
var underscoreString = require('underscore.string');
var staticEval = require('static-eval');
var parseAst = require('esprima').parse;

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
[
  {
    [      
      { "unless" : "isString(request.query.pincode)", "action" : "addErr('pincode is required')" },
      { "set"    : "request.query.pincode", "toUpperCase(request.query.pincode)"},
      { "set"    : "request.query.pincode", "whitelist('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')",
      { "unless" : "isLength(request.query.pincode,14,14)","msg":"pincode must be 14 characters long with only numbers and letters" }
    ]


*/

var validationFns = { sanitizers : {}, validators : {} };
var allFns = {};

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
  allFns[fnName] = validator[fnName];
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
  allFns[fnName] = validator[fnName];
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
  allFns[fnName] = _[fnName];
  validationFns.validators[fnName] = _;
});

//var strFns = {};
_.each([
  "concat",
  "replace",
  "search",
  "slice",
  "split",
  "substr",
  "substring",
  "toLocaleLowerCase",
  "toLocaleUpperCase",
  "toLowerCase",
  "toUpperCase",
  "trim",
  /*"valueOf"*/
], function(fnName) {
  var fn = function() {
    var argArr = _.toArray(arguments);
    var str = argArr[0];
    return _.isString(str) ? String.prototype[fnName].apply(str, argArr.slice(1)) : str;
  };
  allFns[fnName] = fn;
  validationFns.validators[fnName] = fn;
});

_.each({
  /* false if it's a validator */
  "isBlank" : false,
  "stripTags" : true,
  "capitalize " : true,
  "chop" : true,
  "clean" : true,
  "count" : true,
  "chars" : true,
  "swapCase" : true,
  "escapeHTML" : true,
  "unescapeHTML" : true,
  "escapeRegExp" : true,
  "splice" : true,
  "insert" : true,
  "include" : true,
  "join" : true,
  "lines" : true,
  "reverse" : true,
  "startsWith" : false,
  "endsWith" : false,
  "succ" : true,
  "titleize" : true,
  "camelize" : true,
  "underscored" : true,
  "dasherize" : true,
  "classify" : true,
  "humanize" : true,
  "trim" : true,
  "ltrim" : true,
  "rtrim" : true,
  "truncate" : true,
  "prune" : true,
  "words" : true,
  "pad" : true,
  "lpad" : true,
  "rpad" : true,
  "lrpad" : true,
  "vsprintf" : true,
  "toNumber" : true,
  "numberFormat " : true,
  "strRight" : true,
  "strRightBack" : true,
  "strLeft" : true,
  "strLeftBack" : true,
  "toSentence" : true,
  "toSentenceSerial" : true,
  "slugify" : true,
  "surround" : true,
  "quote" : true,
  "unquote" : true,
  "exports" : true,
  "repeat" : true,
  "naturalCmp" : true,
  "levenshtein" : true,
  "toBoolean" : true
}, function(isSanitizer, fnName) {
  if ( isSanitizer ) {
    validationFns.sanitizers[fnName] = underscoreString;
  } else {
    validationFns.validators[fnName] = underscoreString;
  }
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

function isMsg(item) {
  return _.isString(item) && item.indexOf('## ') === 0; 
}

/*
  {
    "request.query.pincode" : {
      { "if"      : "isUndefined(value)", "result" : true, 
      { "if"      : "isUndefined(value)", "msg" : "pincode is a required field" },
      { "assign"  : "toUpperCase(value)" },
      { "assign"  : "whitelist(value,'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')" },
      { "unless" : "value.length != 14", "msg":"pincode must be 14 characters long with only numbers and letters" }
    }
  }

  the way this works is that we will hit the callback if the if/unless statements fail.  the key and the
  statement obj will be returned so you can figure out how the hell you want to deal with the errors.

  the definition statement that was passed in will 
*/
exports.express = function(pDef,pContext,callback) {

  var def = _.cloneDeep(pDef);
  var proceed; 

  if ( ! _.isObject(def) && ! _.isArray(def) ) {
    throw "def must be an array, found " + def;
  }

  var expressions = ['if','unless','set'];

  _.each(def, function(expSet,name) {
    if ( ! _.isArray(expSet) ) {
      throw "expressionSet must be an array, found " + expSet;
    }
    var running = true;
    for ( var i = 0; i < expSet.length && running; i++ ) {
      var exp = expSet[i];
      var val = deep(pContext, name);
      console.log('setting context value to ' + val);
      pContext.value = val;

      var astKeys = _.intersection(_.keys(exp), expressions);
      if ( astKeys.length !== 1 ) { throw "expression should have one of " + expressions; }
      var expression = exp[astKeys[0]];
      var ast = parseAst(expression).body[0].expression;
      //var combinedContext = _.defaults(allFns, pContext);
      //TODO: this is horribly inefficient.  rebuild this!!!!!
      var combinedContext = _.cloneDeep(allFns);
      _.defaults(combinedContext, pContext);
      //console.log('VALUE IN COMBINED CONTEXT ' + combinedContext.value + ' allFNS=' + allFns.value);
      var result = staticEval(ast, combinedContext);
      console.log('Exp',exp,"\n","  expression=", expression, "\n","val",val,"result", result, "\n  Context",pContext);

      if ( astKeys[0] === 'if' ) {
        exp.pass = ! result;
        if ( ! exp.pass ) {
          console.log('  Reporting violation (if)');
          proceed = callback(exp,name);
          running = proceed !== false;
        }
      } else if ( astKeys[0] === 'unless' ) {
        exp.pass = result;
        if ( ! exp.pass ) {
          console.log('  Reporting violation (unless)');
          proceed = callback(exp,name);
          running = proceed !== false;
        }
      } else if ( astKeys[0] === 'set' ) {
        console.log('  Setting context [' + name + '] to [' + JSON.stringify(result) + ']');
        deep(pContext,name, result);
      } 
    }
  });
  return def;
};

/**
 * validates the definition with the
 * provided value.  If an value passes
 * all tests then it will be set to the
 * result from the filters.  Otherwise,
 * it will be left alone.
 * This method will return false if there
 * are no validation errors.
 */
exports.valid = function(def, val) {
  /*console.log('validate called with', arguments); */
  var issues = {};

  _.each(def, function(validations, path) {
    var valueAtPath = deep(val, path);
    var valid = true;

    if ( ! _.isArray(validations) ) {
      throw "the validation set must be an array, found " + JSON.stringify(validations);
    }
    validations = validations.length > 0 && ! _.isArray(validations[0]) ? [ validations ] : validations;

    for ( var i = 0; i < validations.length && valid; i++ ) {
      var validationSet =  _.isArray(validations[i]) ? validations[i] : [ validations[i] ];
      var validationName = validationSet[0];
      console.log("Val at path=" + path, valueAtPath);
      console.log("\npath=" + path + " val=" + valueAtPath + " running " + validationName);

      var fnName = validationName.replace(/\s/g, '');
      var sanitizer = false;
      var inverted = false;

      var validationMsg = _.find(validationSet, isMsg);
      validationMsg = validationMsg ? validationMsg.replace(/^##\s*/,'') : fnName;

      if ( fnName.charAt(0) === '!' ) {
        fnName = fnName.substring(1);
        inverted = true;
      }
      sanitizer = _.has(validationFns.sanitizers, fnName);  
      
      var validationArgs = _.reject(validationSet.slice(1), isMsg);

      console.log('fnName=' + fnName + ", sanitizer?=" + sanitizer + ' inverted=' + inverted + ' args=', validationArgs);
      var lib = sanitizer ? validationFns.sanitizers[fnName] : validationFns.validators[fnName];
      if ( typeof lib === 'undefined' ) {
        throw "function [" + fnName + "] not registered";
      }
      var fn = lib[fnName];
      var fnArgs = validationArgs.slice(0);
      fnArgs.unshift(valueAtPath);
      var result = fn.apply(null, fnArgs);
      console.log("  result=", result);

      if ( sanitizer ) {
        /* this is a filter so let's just set the value */
        /* console.log('  setting path ' + path + ' to value [' + result + '] context', val); */
        /* deep(val, path, result); */
        valueAtPath = result;
      } else {
        /*console.log('  ' + path + ':' + validationName + ' result=' + result + " inverted=" + inverted);*/
        /* if normal, valid == true, if inverted, valid == false */
        if ( result === inverted ) {
          issues[path] = validationMsg;
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
  return _.keys(issues).length === 0 ? true : issues;
};



