let database = {
  "states": [
    {
      "name": "x",
      "variables": ["q"]
    },
    {
      "name": "y",
      "variables": ["p", "q", "r"]
    },
    {
      "name": "z",
      "variables": ["p"]
    },
    {
      "name": "a",
      "variables": ["p", "q"]
    },
    {
      "name": "b",
      "variables": ["p"]
    }
  ],
  "relations": [
    //["a", "b"], a -> b
    ["x", "y"],
    ["x", "z"],
    ["y", "a"],
    ["z", "b"]
  ]
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
      return !p[0];
    },
    length = 1
  ),
  new operator(
    name = "AND",
    string = "^",
    operation = function(p) {
      return p[0] && p[1];
    },
    length = 2
  ),
  new operator(
    name = "OR",
    string = "U",
    operation = function(p) {
      return p[0] || p[1];
    },
    length = 2
  ),
  new operator(
    name = "IMPLIES",
    string = ">",
    operation = function(p) {
      return !p[0] || p[1];
    },
    length = 2
  ),
  new operator(
    name = "EXISTS",
    string = "?",
    operation = function(p) {
      return p[0];
    },
    length = 1
  ),
  new operator(
    name = "FOR EACH",
    string = "*",
    operation = function(p) {
      return p[0];
    },
    length = 1
  )
]

function calculate_input(expression) {
  //Example expression = "A!B!UC!DU>"
  var stack = []
  
  for (let character of expression) {
    stack.push(character);
  }

  var initial_state_name = database.states[0].name;

  if (is_valid_expression(expression)) {
    return calculate(stack, stack.length - 1, initial_state_name);
  }

  return throw_error();
}

function calculate(stack, index, state) {
  if (index < 0) {
    return throw_error();
  }

  var character = stack[index];
  var operand_count = 0;
  
  if (is_operator(character)) {
    var operator = character;

    var states_to_check = [state];

    switch (operator) {
      case "!":
        operand_count = 1;
        break;
      case "?": case "*":
        operand_count = 1;
        states_to_check = get_all_state_neighbors(state);
        break;
      case "^": case "U": case ">":
        operand_count = 2;
        break;
      default:
        return throw_error();
    }

    var operation_results = [];

    for (let state_to_check of states_to_check) {
      var operands = []
      
      for (var i = 0; i < operand_count; i++) {
        var operand = calculate(stack, index - (i + 1), state_to_check);
        operands.push(operand);
      }

      var operation_result = perform_operation(operator, operands);
      operation_results.push(operation_result);
    }

    if (operation_results.length == 1) {
      return operation_results[0];
    }
    else {
      var trues = operation_results.filter((f) => f);
      if (operator == "*") {
        return trues.length == operation_results.length;
      }
      else if (operator == "?") {
        return trues.length > 0;
      }
      else {
        return throw_error();
      }
    }
  }

  var variable_value = get_variable_value_at_state(character, state);
  return variable_value;
}

function get_state_by_name(name) {
  return database.states.find((f) => f.name == name);
}

function get_variable_value_at_state(character, state_name) {
  var state = get_state_by_name(state_name);
  return state.variables.find((f) => f == character) != undefined;
}

function is_operator(operation) {
  return get_operator(operation) != null;
}

function get_operator(operation) {
  return operators.find((f) => f.string == operation);
}

function perform_operation(character, operands) {
  var operator = get_operator(character);
  return operator.operation(operands);
}

function throw_error() {
  console.error("This should not be happening.");
  return undefined;
}

function get_all_state_neighbors(state_name) {
  return database.relations.filter((f) => f[0] == state_name).map((f) => f[1]);
}

function is_valid_expression(expression) {
  var counter = 0;

  for (var i = 0; i < expression.length; i++) {
    var character = expression[i];
    
    if (is_operator(character)) {
      var operator = get_operator(character);
      counter -= operator.length;

      if (counter < 0) {
        return false;
      }
    }

    counter++;
  }

  return counter == 1;
}