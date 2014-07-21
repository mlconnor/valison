'use strict';


var valison = require('../lib/valison.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.valison = {
  setUp: function(done) {
    // setup here
    done();
  },
  'no args': function(test) {
    // test.expect(1);
    // tests here
/*
    var def1 = {
     // firstName=trim|isLength(1,20)
      "firstName":[
	["trim"],
        ["toUpperCase"],
        ["reverse"],
	["isLength", 1, 20]
      ],
      "address.addressLine1" : [
	["!isNull"],
        ["!isEmpty"],
	["isLength", 5, 10, "## Address Line 1 should be 5-10 chars long"]
      ]
    };

    test.deepEqual(valison.valid(def1, {"firstName":"Michael",address:{"addressLine1":"6583 Goldenrod"}}), {"address.addressLine1":"Address Line 1 should be 5-10 chars long"}, 'should be {}');

    var def2 = {
      "creditcard" : [
        ["trim"],
        ["whitelist","0123456789"],
        ["isCreditCard", "## Hey man, that's a bogus credit card"]
      ]
    };

    test.deepEqual(valison.valid(def2, {"firstName":"Michael", "creditcard" : " 3725 109 222 299999a "}), {"creditcard":"Hey man, that's a bogus credit card"}, 'should be {cc}');
    test.deepEqual(valison.valid(def2, {"firstName":"Michael", "creditcard" : "  3782 822 463 10005 "}), true, 'should be {}');

    var def3 = {
      "middleName" : [
        ["!isEmpty","## Middle name can't be empty"]
      ]
    };

    test.deepEqual(valison.valid(def3, {"firstName":"Michael", "lastName" : "Connor"}), {"middleName":"Middle name can't be empty"}, 'should be ...');
*/
    var expTest = {
      "request.query.pincode" : [
	{ "unless" : "isString(value)", "msg" : "pincode is a required field" },
	{ "set"    : "toUpperCase(value)" },
	{ "set"    : "whitelist(value, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')" },
	{ "unless" : "value.length == 14", "msg":"pincode must be 14 characters long with only numbers and letters" }
      ]
    };
    valison.express(expTest, {"request":{ "query": {"pincode":" 1234567890aBcD "}}}, function() { console.log('callback invoked with',arguments); return false; });

    test.done();
  }
};
