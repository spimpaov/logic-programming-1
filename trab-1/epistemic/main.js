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
    {"source": "x", "target": "y", "agents": ["a"]},
    {"source": "x", "target": "z", "agents": ["a", "b"]},
    {"source": "y", "target": "a", "agents": ["b"]},
    {"source": "z", "target": "b", "agents": ["a"]}
  ]
}

const operator = class {
  constructor(name, pattern, operation, get_states_to_check, get_agent, validate_results, length) {
    this.name = name;
    this.pattern = pattern;
    this.operation = operation;
    this.get_states_to_check = get_states_to_check;
    this.validate_results = validate_results;
    this.length = length;
    this.get_agent = get_agent;
  }
}

operators = [
  new operator(
    name = "NOT",
    pattern = /\!/,
    operation = function(p) {
      return !p[0];
    },
    get_states_to_check = get_current_state,
    get_agent = function(s) { return undefined },
    validate_results = get_first_and_only_result,
    length = 1
  ),
  new operator(
    name = "AND",
    pattern = /\^/,
    operation = function(p) {
      return p[0] && p[1];
    },
    get_states_to_check = get_current_state,
    get_agent = function(s) { return undefined },
    validate_results = get_first_and_only_result,
    length = 2
  ),
  new operator(
    name = "OR",
    pattern = /\U/,
    operation = function(p) {
      return p[0] || p[1];
    },
    get_states_to_check = get_current_state,
    get_agent = function(s) { return undefined },
    validate_results = get_first_and_only_result,
    length = 2
  ),
  new operator(
    name = "IMPLIES",
    pattern = /\>/,
    operation = function(p) {
      return !p[0] || p[1];
    },
    get_states_to_check = get_current_state,
    get_agent = function(s) { return undefined },
    validate_results = get_first_and_only_result,
    length = 2
  ),
  new operator(
    name = "EXISTS",
    pattern = /\{\?\w\}/,
    operation = function(p) { return p[0]; },
    get_states_to_check = get_all_state_neighbors,
    get_agent = function(string) { return string.match(/\w/)[0] },
    validate_results = function(r) {
      var trues = r.filter((f) => f);
      return trues.length > 0;      
    },
    length = 1
  ),
  new operator(
    name = "FOR EACH",
    pattern = /\{\*\w\}/,
    operation = function(p) { return p[0]; },
    get_states_to_check = get_all_state_neighbors,
    get_agent = function(string) { return string.match(/\w/)[0] },
    validate_results = function(r) {
      var trues = r.filter((f) => f);
      return trues.length == r.length;
    },
    length = 1
  ),
  new operator(
    name = "PUBLIC ANNOUNCEMENT",
    pattern = /\@/,
    operation = function(p) { return p[1]; },
    get_states_to_check = get_current_state,
    get_agent = function(s) { return undefined },
    validate_results = get_first_and_only_result,
    length = 2
  )
]

function calculate_input(expression) {
  // Expecting expression in postfixed notation
  
  var stack = []
  for (let character of expression) {
    stack.push(character);
  }

  var root_state = database.states[0];
  if (is_valid_expression(stack)) {
    return calculate(stack, stack.length - 1, root_state, database.states.slice(0)).value;
  }

  return throw_error();
}

function calculate(stack, index, state, valid_states) {
  if (index < 0) {
    return throw_error();
  }

  var op_string_obj = get_op_string(stack, index, forwards = false);
  var op_string = op_string_obj.op_string;
  index = op_string_obj.new_index;
  
  if (is_operator(op_string)) {
    var operator = get_operator(op_string);
    
    var deepest_index = index;
    var operation_results = [];
    
    if (operator.name == 'PUBLIC ANNOUNCEMENT') {
      var phi_states = [];
      
      for (let state of valid_states) {
        var operand = calculate(stack, index - 1, state, valid_states);
        if (operand.value) {
          phi_states.push(state);
        }
      }
      
      valid_states = phi_states;
    }
    
    var states_to_check = operator.get_states_to_check(state, operator.get_agent(op_string), valid_states);

    for (let state_to_check of states_to_check) {
      var operands = []
      var last_index = index;
      
      for (var i = 0; i < operator.length; i++) {
        var operand = calculate(stack, last_index - 1, state_to_check, valid_states);
        last_index = operand.index;
        operands.push(operand.value);
      }

      var operation_result = operator.operation(operands);
      operation_results.push(operation_result);
      deepest_index = last_index;
    }

    return {"index": deepest_index, "value": operator.validate_results(operation_results)};
  }

  return {"index": index, "value": get_variable_value_at_state(op_string, state)};
}

function get_variable_value_at_state(op_string, state) {
  return state.variables.find((f) => f == op_string) != undefined;
}

function is_operator(operation) {
  return get_operator(operation) != null;
}

function get_operator(operation) {
  return operators.find((f) => operation.search(f.pattern) != -1);
}

// 'op string' purposefully ambiguous to mean both 'operator string' and 'operand string'
function get_op_string(array, index, forwards = true) {
  var op_string = array[index];

  var index_start_char = index;
  var index_end_char = index;

  // Sometimes, the operator spans more than one character (e.g. '{?a}').
  // This snippet guarantees that we will return the whole operator, instead of only the first character.
  if (forwards) {
    if (op_string == "{") {
      var i = 0;
      for (i = index_start_char; i < array.length && array[i] != "}"; i++);
      index_end_char = i;
      index = index_end_char;
    }
  } else /*backwards*/ {
    if (op_string == "}") {
      var i = 0;
      for (i = index_end_char; i >= 0 && array[i] != "{"; i--);
      index_start_char = i;
      index = index_start_char;
    }
  }
  
  op_string = array.slice(index_start_char, index_end_char + 1).join("");
  return {"op_string": op_string, "new_index": index};
}

function get_state_by_name(name) {
  return database.states.find((f) => f.name == name);
}

function get_current_state(current_state, agent, valid_states) {
  return [current_state];
}

function get_all_state_neighbors(current_state, agent, valid_states) {
  return database.relations
    .filter((f) => f.source == current_state.name 
      && f.agents.includes(agent)
      && valid_states.map((s) => s.name).includes(f.target))
    .map((f) => get_state_by_name(f.target));
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
    var op_string_obj = get_op_string(expression, i, forwards = true);
    var op_string = op_string_obj.op_string;
    i = op_string_obj.new_index;
    
    if (is_operator(op_string)) {
      var operator = get_operator(op_string);
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