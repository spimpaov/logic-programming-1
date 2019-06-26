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
  handleFadeInEffect();
}

function updateDatabaseFromInput() {
  var states_input = document.getElementById('states').value;
  var relations_input = document.getElementById('relations').value;
  var states = JSON.parse(states_input);
  var relations = JSON.parse(relations_input);
  database.states = states;
  database.relations = relations;
  updateDatabaseSpan(states_input, relations_input);
  updateGraphVisualization(database.states, database.relations);
}

function updateDatabaseSpan(states, relations) {
  document.getElementById('states').value = states;
  document.getElementById('relations').value = relations;
}

function getStateLabel(state) {
  var string = "<b>" + state.name + "</b>: ("
  
  for (var i = 0; i < state.variables.length; i++) {
    string += state.variables[i];
    if (i < state.variables.length - 1) string += ", ";
  }

  string += ")";
  return string;
}

function updateGraphVisualization(states, relations) {
  var string = "graph TD\n";
  relations.forEach((relation) => {
    var source = get_state_by_name(relation[0]);
    var target = get_state_by_name(relation[1]);

    string += "    " + source.name + "[\"" + getStateLabel(source) + "\"] --> " + target.name + "[\"" + getStateLabel(target) + "\"]\n"
  });

  var element = document.getElementById('graph_visualization')
  element.innerHTML = string;
  element.removeAttribute('data-processed');
  mermaid.init(undefined, "#graph_visualization");
}

function handleFadeInEffect() {
  document.getElementById('result').className = "";
  setTimeout(function() {
    document.getElementById('result').classList.add("animatee");
  }, 100);
}