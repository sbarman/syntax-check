'use strict'

/*
 * Class to check whether a JavaCode program contains matches certain syntax
 * criteria */
var SyntaxCheck = (function SyntaxCheckClosure() {
  function SyntaxCheck(code) {
    var options = {
      tolerant: true,
      sourceType: 'script'
    };

    // Try to parse program, if error is thrown then most likely the code
    // cannot be parsed
    try {
      var syntax = esprima.parse(code, options);
      this.syntax = syntax;
      this.tokens = syntax.tokens;
      this.error = false;
    } catch (e) {
      this.error = true;
      console.error(e);
    }

  }

  // Convert syntax name in syntax contraints to nodes in Esprima syntax tree
  // http://esprima.org/doc/index.html#ast
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

  // Define the children of certain node types. This structure is used to
  // recurse down the tree.
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

  /*
   * Helper function to check if the syntax tree contains certain node types
   */
  function containsSyntaxHelper(root, nodeTypes) {
    var seenNode = {};
    var remaining = 0;

    // Convert our syntax constraints to Esprima node types
    for (var i = 0, ii = nodeTypes.length; i < ii; ++i) {
      var nodeType = nodeTypes[i];
      if (nodeType in nameToType) {
        seenNode[nameToType[nodeType]] = false;
        remaining++;
      } else {
        console.error('Skipping unknown JS syntax:' + nodeType);
      }
    }

    // Depth first search through syntax tree, checking if all required node
    // types have been visited
    var nodesToVisit = [root];
    while (nodesToVisit.length > 0) {
      var node = nodesToVisit.pop();
      var type = node.type;

      // Check if we can cross off another node type
      if (type in seenNode && !seenNode[type]) {
        seenNode[type] = true;
        remaining--;
        if (remaining == 0)
          return true;
      }

      // Add children
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

  /*
   * Helper function to check if the syntax tree excludes certain node types
   */
  function excludesSyntaxHelper(root, nodeTypes) {
    var nodes = new Set();

    // Convert our syntax constraints to Esprima node types
    for (var i = 0, ii = nodeTypes.length; i < ii; ++i) {
      var nodeType = nodeTypes[i];
      if (nodeType in nameToType) {
        nodes.add(nameToType[nodeType]);
      } else {
        console.error('Skipping unknown JS syntax:' + nodeType);
      }
    }

    // Depth first search through syntax tree
    var nodesToVisit = [root];
    while (nodesToVisit.length > 0) {
      var node = nodesToVisit.pop();
      var type = node.type;

      // Check if node is one of the excluded types
      if (nodes.has(type)) {
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
   * Check to see if syntax tree matches a certain structure
   *
   * codeStructure represents the structure of the code and can take the
   * following forms:
   *
   * (1) string representing a single syntax element
   * Ex: 'for'
   *
   * (2) object with a field representing a sequence of syntax elements:
   *   sequence: list of elements, each representing a code structure
   * Ex: {sequence: ['for', 'if']}
   *
   * (3) object with the fields representing a syntax element and its children
   * the children are unordered
   *   type: string representing syntax element 
   *   child: the child's code structures
   * Ex: {type: 'for', child: 'if'}
   */
  function matchesStructureHelper(root, codeStructure) {
    // If root is null, then match cannot happen
    if (!root)
      return false;

    // Code structure with single node is just a case of checking if the tree
    // hass a certain syntax element
    if (typeof codeStructure == 'string') {
      return containsSyntaxHelper(root, [codeStructure]);
    }

    // Check if codeStructure is valid
    if (!(typeof codeStructure == 'object' && 
          (('sequence' in codeStructure) ||
           ('type' in codeStructure && 'child' in codeStructure)))) {
      console.log('Unknown code structure:' + codeStructure);
      return false;
    }

    var rootType = root.type;
    // Check sequence constraint
    if ('sequence' in codeStructure) {
      var stmts = null;
      // Only certain node types can match sequence constraints
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
        // Attempt to march sequence constraints to the list of statements
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
    // Check children constraints
    } else if ('type' in codeStructure && 'child' in codeStructure) {
      var type = codeStructure.type;
      var childStructure = codeStructure.child;
      var rootType = root.type;
      // Current root matches the current codeStructure element
      if (rootType == nameToType[type] && rootType in typeToChildren) {
        var childrenFields = typeToChildren[rootType];

        // Try to find matching children
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

    // We did not find a match yet, so lets recurse down the syntax tree to
    // see if any other parts of the program match constraints
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

  // Create class methods using helper functions
  SyntaxCheck.prototype = {
    containsSyntax: function _containsSyntax(nodeTypes) {
      if (this.error)
        throw "Error parsing";
      return containsSyntaxHelper(this.syntax, nodeTypes);
    },
    excludesSyntax: function _excludesSyntax(nodeTypes) {
      if (this.error)
        throw "Error parsing";
      return excludesSyntaxHelper(this.syntax, nodeTypes);
    },
    matchesStructure: function _matchesStructure(nodeStructure) {
      if (this.error)
        throw "Error parsing";
      return matchesStructureHelper(this.syntax, nodeStructure);
    },
    check: function _check(constraint) {
      var type = constraint.type;
      var arg = constraint.arg;

      if (type in this) {
        return this[type].call(this, arg)
      } else {
        throw 'Unknown constraint';
      }
    }
  };

  return SyntaxCheck;
})();



