function calculateBasedOnUserInput() {
  var result = calculate(document.getElementById('input').value);
  var output = result;

  if (result != null && result != undefined) {
    output = result;
  } else {
    output = "Valor indefinido.";
  }

  document.getElementById('result').textContent = output;
}

function updateDatabaseFromInput() {
  var input = document.getElementById('database').value;
  database = JSON.parse(input);
  updateDatabaseSpan(input);
}

function updateDatabaseSpan(string) {
  document.getElementById('currentDatabase').textContent = string;
}