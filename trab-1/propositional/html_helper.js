function calculateBasedOnUserInput() {
  var result = calculate(document.getElementById('input').value);
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
  var input = document.getElementById('database').value;
  database = JSON.parse(input);
  updateDatabaseSpan(input);
}

function updateDatabaseSpan(string) {
  document.getElementById('database').textContent = string;
}

function handleFadeInEffect() {
  document.getElementById('result').className = "";
  setTimeout(function() {
    document.getElementById('result').classList.add("animatee");
  }, 100);
}