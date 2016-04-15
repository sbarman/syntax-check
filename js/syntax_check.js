'use strict'

var SyntaxCheck = (function SyntaxCheckClosure() {
  function SyntaxCheck(code) {
    var options = {
      tolerant: true,
      sourceType: 'script'
    };

    var syntax = esprima.parse(code, options);

    this.syntax = syntax;
    this.tokens = syntax.tokens;
  }

  var nameToType = {
    // Expressions
    assignment: 'AssignmentExpression',
    array: 'ArrayExpression',
    arrowFunction: 'ArrowFunctionExpression',
    binaryExpr: 'BinaryExpression',
    conditionalExpr: 'ConditionalExpression',
    unaryExpr: 'UnaryExpression',
    updateExpr: 'UpdateExpression',
    yield: 'YieldExpression',
    //
    // Statements
    break: 'BreakStatement',
    catch: 'CatchClause',
    continue: 'ContinueStatement',
    doWhile: 'DoWhileStatement',
    for: 'ForStatement',
    forOf: 'ForOfStatement',
    forIn: 'ForInStatement',
    if: 'IfStatement',
    label: 'LabeledStatement',
    return: 'ReturnStatement',
    switch: 'SwitchStatement',
    throw: 'ThrowStatement',
    try: 'TryStatement',
    while: 'WhileStatement',
    with: 'WithStatement',
    //
    // Declarations
    function: 'FunctionDeclaration',
    var: 'VariableDeclaration',
    //
    // Unused
    // AssignmentPattern: 'AssignmentPattern',
    // ArrayPattern: 'ArrayPattern',
    // BlockStatement: 'BlockStatement',
    // CallExpression: 'CallExpression',
    // ClassBody: 'ClassBody',
    // ClassDeclaration: 'ClassDeclaration',
    // ClassExpression: 'ClassExpression',
    // DebuggerStatement: 'DebuggerStatement',
    // EmptyStatement: 'EmptyStatement',
    // ExportAllDeclaration: 'ExportAllDeclaration',
    // ExportDefaultDeclaration: 'ExportDefaultDeclaration',
    // ExportNamedDeclaration: 'ExportNamedDeclaration',
    // ExportSpecifier: 'ExportSpecifier',
    // ExpressionStatement: 'ExpressionStatement',
    // FunctionExpression: 'FunctionExpression',
    // Identifier: 'Identifier',
    // ImportDeclaration: 'ImportDeclaration',
    // ImportDefaultSpecifier: 'ImportDefaultSpecifier',
    // ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
    // ImportSpecifier: 'ImportSpecifier',
    // Literal: 'Literal',
    // LogicalExpression: 'LogicalExpression',
    // MemberExpression: 'MemberExpression',
    // MetaProperty: 'MetaProperty',
    // MethodDefinition: 'MethodDefinition',
    // NewExpression: 'NewExpression',
    // ObjectExpression: 'ObjectExpression',
    // ObjectPattern: 'ObjectPattern',
    // Program: 'Program',
    // Property: 'Property',
    // RestElement: 'RestElement',
    // SequenceExpression: 'SequenceExpression',
    // SpreadElement: 'SpreadElement',
    // Super: 'Super',
    // SwitchCase: 'SwitchCase',
    // TaggedTemplateExpression: 'TaggedTemplateExpression',
    // TemplateElement: 'TemplateElement',
    // TemplateLiteral: 'TemplateLiteral',
    // ThisExpression: 'ThisExpression',
    // VariableDeclarator: 'VariableDeclarator',
  };

  var typeToChildren = {
    AssignmentExpression: ['left', 'right'],
    AssignmentPattern: ['right'],
    ArrayExpression: ['elements'],
    ArrowFunctionExpression: ['body'],
    BinaryExpression: ['left', 'right'],
    BlockStatement: ['body'],
    CallExpression: ['callee', 'arguments'],
    CatchClause: ['body'],
    ConditionalExpression: ['test', 'consequent', 'alternate'],
    DoWhileStatement: ['test', 'body'],
    ExpressionStatement: ['expression'],
    ForStatement: ['init', 'test', 'update', 'body'],
    ForOfStatement: ['left', 'right', 'body'],
    ForInStatement: ['left', 'right', 'body'],
    FunctionDeclaration: ['body'],
    FunctionExpression: ['params, body'],
    IfStatement: ['test', 'consequent', 'alternate'],
    LabeledStatement: ['body'],
    LogicalExpression: ['left', 'right'],
    MemberExpression: ['object', 'property'],
    MethodDefinition: ['value'],
    NewExpression: ['callee', 'arguments'],
    ObjectExpression: ['properties'],
    Program: ['body'],
    SequenceExpression: ['expressions'],
    SpreadElement: ['argument'],
    SwitchCase: ['test', 'consequent'],
    SwitchStatement: ['discriminant', 'cases'],
    ThrowStatement: ['argument'],
    TryStatement: ['block', 'handler', 'finalizer'],
    UnaryExpression: ['argument'],
    UpdateExpression: ['argument'],
    VariableDeclaration: ['declarations'],
    VariableDeclarator: ['init'],
    WhileStatement: ['test', 'body'],
    WithStatement: ['object', 'body'],
    YieldExpression: ['argument']
  }

  function containsSyntaxHelper(root, nodeTypes) {
    var seenNode = {};
    var remaining = 0;

    for (var i = 0, ii = nodeTypes.length; i < ii; ++i) {
      var nodeType = nodeTypes[i];
      if (nodeType in nameToType) {
        seenNode[nameToType[nodeType]] = false;
        remaining++;
      } else {
        console.error('Skipping unknown JS syntax:' + nodeType);
      }
    }

    var nodesToVisit = [root];
    while (nodesToVisit.length > 0) {
      var node = nodesToVisit.pop();
      var type = node.type;

      if (type in seenNode && !seenNode[type]) {
        seenNode[type] = true;
        remaining--;
        if (remaining == 0)
          return true;
      }

      if (type in typeToChildren) {
        var childrenFields = typeToChildren[type];
        for (var i = 0, ii = childrenFields.length; i < ii; ++i) {
          var field = childrenFields[i];
          var child = node[field];
          if (Array.isArray(child)) {
            for (var j = 0, jj = child.length; j < jj; ++j) {
              if (child[j])
                nodesToVisit.push(child[j]);
            }
          } else {
            if (child)
              nodesToVisit.push(child);
          }
        }
      }
    }
    return false;
  }

  function excludesSyntaxHelper(root, nodeTypes) {
    var nodes = new Set();

    for (var i = 0, ii = nodeTypes.length; i < ii; ++i) {
      var nodeType = nodeTypes[i];
      if (nodeType in nameToType) {
        nodes.add(nameToType[nodeType]);
      } else {
        console.error('Skipping unknown JS syntax:' + nodeType);
      }
    }

    var nodesToVisit = [root];
    while (nodesToVisit.length > 0) {
      var node = nodesToVisit.pop();
      var type = node.type;

      if (type in nodes) {
        return false
      }

      if (type in typeToChildren) {
        var childrenFields = typeToChildren[type];
        for (var i = 0, ii = childrenFields.length; i < ii; ++i) {
          var field = childrenFields[i];
          var child = node[field];
          if (Array.isArray(child)) {
            for (var j = 0, jj = child.length; j < jj; ++j) {
              if (child[j])
                nodesToVisit.push(child[j]);
            }
          } else {
            if (child)
              nodesToVisit.push(child);
          }
        }
      }
    }
    return true;
  }

  /*
   * codeStructure represents the structure of the code and can take the
   * following forms
   *
   * string representing a single syntax element
   * Ex: 'for'
   *
   * object with a field representing a sequence of syntax elements:
   *   sequence: list of elements, each representing a code structure
   * Ex: {sequence: ['for', 'if']}
   *
   * object with the fields representing a syntax element and its children
   * the children are unordered
   *   type: string representing syntax element 
   *   child: the child's code structures
   * Ex: {type: 'for', child: 'if'}
   */
  function matchesStructureHelper(root, codeStructure) {
    if (!root)
      return false;

    if (typeof codeStructure == 'string') {
      return containsSyntaxHelper(root, [codeStructure]);
    }

    if (!(typeof codeStructure == 'object' && 
          (('sequence' in codeStructure) ||
           ('type' in codeStructure && 'child' in codeStructure)))) {
      console.log('Unknown code structure:' + codeStructure);
      return false;
    }

    var rootType = root.type;
    if ('sequence' in codeStructure) {
      var stmts = null;
      if (rootType == 'BlockStatement') {
        stmts = root.body;
      } else if (rootType == 'SwitchCase') {
        stmts = root.consequent;
      } else if (rootType == 'Program') {
        stmts = root.body;
      }
      
      if (stmts) {
        var seq = codeStructure.sequence;
        var seqIdx = 0;
        var stmtsIdx = 0;
        var seqLength = seq.length;
        var stmtsLength = stmts.length;
        while (seqIdx < seqLength && stmtsIdx < stmtsLength &&
            (stmtsLength - stmtsIdx >= seqLength - seqIdx)) {
          if (matchesStructureHelper(stmts[stmtsIdx], seq[seqIdx])) {
            stmtsIdx++;
            seqIdx++;
          } else {
            stmtsIdx++;
          }
        }
        if (seqIdx == seqLength)
          return true;
      }
    } else if ('type' in codeStructure && 'child' in codeStructure) {
      var type = codeStructure.type;
      var childStructure = codeStructure.child;
      var rootType = root.type;
      if (rootType == nameToType[type] && rootType in typeToChildren) {
        var childrenFields = typeToChildren[rootType];

        for (var i = 0, ii = childrenFields.length; i < ii; ++i) {
          var field = childrenFields[i];
          var child = root[field];
          if (Array.isArray(child)) {
            for (var j = 0, jj = child.length; j < jj; ++j) {
              if (matchesStructureHelper(child[j], childStructure)) {
                return true;
              }
            }
          } else {
            if (matchesStructureHelper(child, childStructure)) {
              return true;
            }
          }
        }
      }
    }

    if (rootType in typeToChildren) {
      var childrenFields = typeToChildren[rootType];
      for (var i = 0, ii = childrenFields.length; i < ii; ++i) {
        var field = childrenFields[i];
        var child = root[field];
        if (Array.isArray(child)) {
          for (var j = 0, jj = child.length; j < jj; ++j) {
            if (matchesStructureHelper(child[j], codeStructure))
              return true;
          }
        } else {
          if (matchesStructureHelper(child, codeStructure))
            return true;
        }
      }
    }
    return false;
  }

  SyntaxCheck.prototype = {
    containsSyntax: function _containsSyntax(nodeTypes) {
      return containsSyntaxHelper(this.syntax, nodeTypes);
    },
    excludesSyntax: function _excludesSyntax(nodeTypes) {
      return excludesSyntaxHelper(this.syntax, nodeTypes);
    },
    matchesStructure: function _matchesStructure(nodeStructure) {
      return matchesStructureHelper(this.syntax, nodeStructure);
    }
  };

  return SyntaxCheck;
})();



