'use strict'

importScripts('esprima.js', 'syntax_check.js');

onmessage = function(e) {
  var program = e.data[0];
  var elementIdToTest = e.data[1];

  console.log('here');

  var check = new SyntaxCheck(program);
  var elementIdToResult = {};
  for (var elementId in elementIdToTest) {
    var test = elementIdToTest[elementId];
    try {
      if (check.check(test)) {
        elementIdToResult[elementId] = 'Pass';
      } else {
        elementIdToResult[elementId] = 'Fail';
      }
    } catch (e) {
      elementIdToResult[elementId] = 'Cannot parse';
    }
  }
  postMessage(elementIdToResult);
}

