let database = {
  "A": true,
  "B": false,
  "C": true,
  "D": false
}

const operator = class {
  constructor(name, string, operation, length) {
    this.name = name;
    this.string = string;
    this.operation = operation;
    this.length = length;
  }
}

operators = [
  new operator(
    name = "NOT",
    string = "!",
    operation = function(p) {
      return !getValue(p[0]);
    },
    length = 1
  ),
  new operator(
    name = "AND",
    string = "^",
    operation = function(p) {
      return getValue(p[0]) && getValue(p[1]);
    },
    length = 2
  ),
  new operator(
    name = "OR",
    string = "U",
    operation = function(p) {
      return getValue(p[0]) || getValue(p[1]);
    },
    length = 2
  ),
  new operator(
    name = "IMPLIES",
    string = ">",
    operation = function(p) {
      return !getValue(p[0]) || getValue(p[1]);
    },
    length = 2
  )
]

function calculate(expression) {
  var database = database;
  
  //Example expression = "A!B!UC!DU>"
  var stack = []
  
  for (let character of expression) {
    stack.push(character);
    var operator = getOperator(character);
    
    if (operator) {
      stack.pop();

      var variables = []
      for (var i = 0; i < operator.length; i++) {
        variables.unshift(stack.pop());
      }

      var result = operator.operation(variables);
      stack.push(result);
    }
  }

  if (stack.length != 1) {
    console.error("Stack didn't return a single result.");
    return undefined;
  }
  else {
    return getValue(stack.pop());
  }
}

function getOperator(operation) {
  return operators.find((f) => f.string == operation);
}

function getValue(variable) {
  switch (typeof(variable)) {
    case "boolean":
      return variable;
    case "string":
      return database[variable];
    default:
      return undefined;
  }
}