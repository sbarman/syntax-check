'use strict'

// List of sample tests
var tests = [
  {
    description: "Uses 'for loop' and 'variable declartion'",
    test: {
      type: 'containsSyntax',
      arg: ['for', 'var']
    }
  },
  {
    description: "Uses 'try statement' and 'catch clause'",
    test: {
      type: 'containsSyntax',
      arg: ['try', 'catch']
    }
  },
  {
    description: "Uses 'throw statement'",
    test: {
      type: 'containsSyntax',
      arg: ['throw']
    }
  },
  {
    description: "Does not use 'break statement'",
    test: {
      type: 'excludesSyntax',
      arg: ['break']
    }
  },
  {
    description: "Does not use 'while loop' or an 'if statement'",
    test: {
      type: 'excludesSyntax',
      arg: ['while', 'if']
    }
  },
  {
    description: "Does not use 'switch statement'",
    test: { 
      type: 'excludesSyntax',
      arg: ['switch']
    }
  },
  {
    description: "Contains two 'for loops' in sequence'",
    test: {
      type: 'matchesStructure',
      arg: {sequence: ['for', 'for']}
    }
  },
  {
    description: "Contains 'if statement' inside a 'for loop'",
    test: {
      type: 'matchesStructure',
      arg: {type:'for', child: 'if'}
    }
  },
  {
    description: "Contains 'break statement' inside an 'if statement' inside a 'for loop'",
    test: {
      type: 'matchesStructure',
      arg: {type:'for', child: {type: 'if', child: 'break'}}
    }
  }
];

// Add sample tests to output div
var outputDiv = document.getElementById('output');
var elementIdToTest = {};
for (var i = 0, ii = tests.length; i < ii; ++i) {
  var test = tests[i];
  var testDiv = document.createElement('div');
  testDiv.textContent = test.description + ': ';

  var resultSpan = document.createElement('span');
  var id = 'result' + i;
  resultSpan.id = id;
  testDiv.appendChild(resultSpan);
  outputDiv.appendChild(testDiv);
  elementIdToTest[id] = test.test;
}

var editor = document.getElementById('editor');

/*
 * Function to update results in output div
 */
if (window.Worker) {
  var syntaxWorker = new Worker('js/worker.js');

  var runTests = function() {
    var program = editor.value;
    syntaxWorker.postMessage([program, elementIdToTest]);
  }

  syntaxWorker.onmessage = function(e) {
    var elementIdToResult = e.data;
    for (var elementId in elementIdToResult) {
      var result = elementIdToResult[elementId];
      var element = document.getElementById(elementId);
      element.innerHTML = result;
    }
  }
} else {
  var runTests = function() {
    var program = editor.value;
    var check = new SyntaxCheck(program);
    for (var elementId in elementIdToTest) {
      (function() {
        var test = elementIdToTest[elementId];
        var element = document.getElementById(elementId);
        setTimeout(function() {
          try {
            if (check.check(test)) {
              element.innerHTML = 'Pass';
            } else {
              element.innerHTML = 'Fail';
            }
          } catch (e) {
            element.innerHTML = 'Cannot parse';
          }
        }, 0);
      })()
    }
  }
}

// Add event listener to rerun tests when input changes
editor.addEventListener('input', runTests, false);
runTests();
