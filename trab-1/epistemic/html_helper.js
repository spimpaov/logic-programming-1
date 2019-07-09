// [INPUT] Calcula a expressão definida em $("#input")
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

// [INPUT] Atualiza o banco de dados a partir do input
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

// [VISUALIZAÇÃO] Atualiza o <span> com o banco de dados
function updateDatabaseSpan(states, relations) {
  document.getElementById('states').value = states;
  document.getElementById('relations').value = relations;
}

// [VISUALIZAÇÃO] Função auxiliar de visualização de grafo
function getStateLabel(state) {
  var string = "<b>" + state.name + "</b>: ("
  
  for (var i = 0; i < state.variables.length; i++) {
    string += state.variables[i];
    if (i < state.variables.length - 1) string += ", ";
  }

  string += ")";
  return string;
}

// [VISUALIZAÇÃO] Atualiza a visualização do grafo (feito com Mermaid)
function updateGraphVisualization(states, relations) {
  var string = "graph TD\n";
  relations.forEach((relation) => {
    var source = get_state_by_name(relation.source);
    var target = get_state_by_name(relation.target);

    var agents = relation.agents;
    var agents_string = agents.join(", ");
    //To fix a certain visualization bug
    for (var i = 1; i < agents.length; i++) {
      agents_string += "·";
    }
    
    string += "    " + source.name + "[\"" + getStateLabel(source) + "\"] -->|\"" + agents_string + "\"| " + target.name + "[\"" + getStateLabel(target) + "\"]\n"
  });

  var element = document.getElementById('graph_visualization')
  element.innerHTML = string;
  element.removeAttribute('data-processed');
  mermaid.init(undefined, "#graph_visualization");
}

// [COSMÉTICO] Função de Fade-in
function handleFadeInEffect() {
  document.getElementById('result').className = "";
  setTimeout(function() {
    document.getElementById('result').classList.add("animatee");
  }, 100);
}