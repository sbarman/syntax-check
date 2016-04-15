'use strict'

function tests() {
  var text = document.getElementById('editor').textContent;
  var check = new SyntaxCheck(text);
  console.log(check.containsSyntax(['var']));
  console.log(check.excludesSyntax(['var']));
  console.log(check.matchesStructure({type: 'if', child: 'for'}));
  console.log(check.matchesStructure({sequence: ['for','if']}));
}
