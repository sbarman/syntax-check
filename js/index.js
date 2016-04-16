'use strict'

// List of sample tests
var tests = [
  {
    description: "Uses 'for loop' and 'variable declartion'",
    test: function(check) {
      return check.containsSyntax(['for', 'var']);
    }
  },
  {
    description: "Uses 'try statement' and 'catch clause'",
    test: function(check) {
      return check.containsSyntax(['try', 'catch']);
    }
  },
  {
    description: "Uses 'throw statement'",
    test: function(check) {
      return check.containsSyntax(['throw']);
    }
  },
  {
    description: "Does not use 'break statement'",
    test: function(check) {
      return check.excludesSyntax(['break']);
    }
  },
  {
    description: "Does not use 'while loop' or an 'if statement'",
    test: function(check) {
      return check.excludesSyntax(['while', 'if']);
    }
  },
  {
    description: "Does not use 'switch statement'",
    test: function(check) {
      return check.excludesSyntax(['switch']);
    }
  },
  {
    description: "Contains two 'for loops' in sequence'",
    test: function(check) {
      return check.matchesStructure({sequence: ['for', 'for']});
    }
  },
  {
    description: "Contains 'if statement' inside a 'for loop'",
    test: function(check) {
      return check.matchesStructure({type:'for', child: 'if'});
    }
  },
  {
    description: "Contains 'break statement' inside an 'if statement' inside a 'for loop'",
    test: function(check) {
      return check.matchesStructure({type:'for', child: {type: 'if', child: 'break'}});
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
function runTests() {
  var program = editor.value;
  var check = new SyntaxCheck(program);
  for (var elementId in elementIdToTest) {
    (function() {
      var test = elementIdToTest[elementId];
      var element = document.getElementById(elementId);
      setTimeout(function() {
        try {
          if (test(check)) {
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

// Add event listener to rerun tests when input changes
editor.addEventListener('input', runTests, false);
runTests();
