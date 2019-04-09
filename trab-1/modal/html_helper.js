function calculateBasedOnUserInput() {
  var input = document.getElementById('input').value;
  var result = calculate_input(input);
  var output = result;

  if (result != null && result != undefined) {
    if (result) {
      output = "✓ "
    } else {
      output = "✗ "
    }
    output += result + "!";
  } else {
    output = "✗ Valor indefinido!";
  }

  document.getElementById('result').textContent = output;
}

function updateDatabaseFromInput() {
  var states_input = document.getElementById('states').value;
  var relations_input = document.getElementById('relations').value;
  var states = JSON.parse(states_input);
  var relations = JSON.parse(relations_input);
  database.states = states;
  database.relations = relations;
  updateDatabaseSpan(states_input, relations_input);
}

function updateDatabaseSpan(states, relations) {
  document.getElementById('states').value = states;
  document.getElementById('relations').value = relations;
}