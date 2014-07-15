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
    var def1 = {
     // firstName=trim|isLength(1,20)
      "firstName":[
	["trim"],
        ["toUpperCase"],
        ["reverse"],
	["isLength", null, 1, 20]
      ],
      "address.addressLine1" : [
	["!isNull"],
	["isLength","Address Line 1 should be 5-10 chars long", 5, 10]
      ]
    };
    test.deepEqual(valison.validate(def1, {"firstName":"Michael",address:{"addressLine1":"6583 Goldenrod"}}), {"address.addressLine1":"Address Line 1 should be 5-10 chars long"}, 'should be {}');

    var def2 = {
      "creditcard" : [
        ["trim"],
        ["whitelist","0123456789"],
        ["isCreditCard","hey man, that's a bogus card"]
      ]
    };

    test.deepEqual(valison.validate(def2, {"firstName":"Michael", "creditcard" : " 3725 109 222 299999a "}), {"creditcard":"hey man, that's a bogus card"}, 'should be {cc}');
    test.deepEqual(valison.validate(def2, {"firstName":"Michael", "creditcard" : "  3782 822 463 10005 "}), {}, 'should be {}');

    var def3 = {
      "middleName" : [
        ["!isEmpty","Middle name can't be empty"]
      ]
    };

    /* let's test lodash */
    test.deepEqual(valison.validate(def3, {"firstName":"Michael", "lastName" : "Connor"}), {"middleName":"Middle name can't be empty"}, 'should be ...');

    test.done();
  }
};
