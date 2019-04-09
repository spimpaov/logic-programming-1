let database = {
  "states": [
    {
      "name": "x",
      "variables": ["q"]
    }, {
      "name": "y",
      "variables": ["p", "q", "r"]
    }, {
      "name": "z",
      "variables": ["p"]
    }, {
      "name": "a",
      "variables": ["p", "q"]
    }, {
      "name": "b",
      "variables": ["p"]
    }
  ],
  "relations": [
    ["x", "y"],
    ["x", "z"],
    ["y", "a"],
    ["z", "b"]
  ]
}

const operator = class {
  constructor(name, string, operation, states_to_check, validate_results, length) {
    this.name = name;
    this.string = string;
    this.operation = operation;
    this.states_to_check = states_to_check;
    this.validate_results = validate_results;
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
    states_to_check = function(s) { return [s]; },
    validate_results = get_first_and_only_result,
    length = 1
  ),
  new operator(
    name = "AND",
    string = "^",
    operation = function(p) {
      return p[0] && p[1];
    },
    states_to_check = function(s) { return [s]; },
    validate_results = get_first_and_only_result,
    length = 2
  ),
  new operator(
    name = "OR",
    string = "U",
    operation = function(p) {
      return p[0] || p[1];
    },
    states_to_check = function(s) { return [s]; },
    validate_results = get_first_and_only_result,
    length = 2
  ),
  new operator(
    name = "IMPLIES",
    string = ">",
    operation = function(p) {
      return !p[0] || p[1];
    },
    states_to_check = function(s) { return [s]; },
    validate_results = get_first_and_only_result,
    length = 2
  ),
  new operator(
    name = "EXISTS",
    string = "?",
    operation = function(p) { return p[0]; },
    states_to_check = get_all_state_neighbors,
    validate_results = function(r) {
      var trues = r.filter((f) => f);
      return trues.length > 0;      
    },
    length = 1
  ),
  new operator(
    name = "FOR EACH",
    string = "*",
    operation = function(p) { return p[0]; },
    states_to_check = get_all_state_neighbors,
    validate_results = function(r) {
      var trues = r.filter((f) => f);
      return trues.length == r.length;
    },
    length = 1
  )
]

function calculate_input(expression) {
  // expecting expression in postfixed notation
  
  var stack = []
  for (let character of expression) {
    stack.push(character);
  }

  var root_state = database.states[0];
  if (is_valid_expression(expression)) {
    return calculate(stack, stack.length - 1, root_state);
  }

  return throw_error();
}

function calculate(stack, index, state) {
  if (index < 0) {
    return throw_error();
  }

  var character = stack[index];
  
  if (is_operator(character)) {
    var operator = get_operator(character);
    
    var states_to_check = operator.states_to_check(state);
    var operation_results = [];

    for (let state_to_check of states_to_check) {
      var operands = []
      
      for (var i = 0; i < operator.length; i++) {
        var operand = calculate(stack, index - (i + 1), state_to_check);
        operands.push(operand);
      }

      var operation_result = operator.operation(operands);
      operation_results.push(operation_result);
    }

    return operator.validate_results(operation_results);
  }

  return get_variable_value_at_state(character, state);
}

function get_variable_value_at_state(character, state) {
  return state.variables.find((f) => f == character) != undefined;
}

function is_operator(operation) {
  return get_operator(operation) != null;
}

function get_operator(operation) {
  return operators.find((f) => f.string == operation);
}

function get_state_by_name(name) {
  return database.states.find((f) => f.name == name);
}

function get_all_state_neighbors(state) {
  return database.relations.filter((f) => f[0] == state.name).map((f) => get_state_by_name(f[1]));
}

function get_first_and_only_result(results) {
  if (results.length != 1) {
    return throw_error();
  }

  return results[0];
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

function throw_error() {
  console.error("This should not be happening.");
  return undefined;
}