// DEFINITIONS
class state {
    constructor(name, values) {
        this.toString = () => { return this.name; };
        this.name = name;
        this.values = values;
    }
    equals(obj) {
        return this.name == obj.name;
    }
}
class transition {
    constructor(source, target) {
        this.source = source;
        this.target = target;
    }
}
class model {
    constructor(name, states, transitions) {
        this.name = name;
        this.states = states;
        this.transitions = transitions;
    }
    equals(obj) {
        return this.name == obj.name;
    }
    getStateByName(name) {
        return this.states.find((s) => s.name == name);
    }
}
class visit {
    constructor(model_M, model_N, root_M, root_N) {
        this.model_M = model_M;
        this.model_N = model_N;
        this.root_M = root_M;
        this.root_N = root_N;
    }
    equals(obj) {
        return (this.model_M.equals(obj.model_M) && this.model_N.equals(obj.model_N) &&
            this.root_M.equals(obj.root_M) && this.root_N.equals(obj.root_N))
            ||
                (this.model_M.equals(obj.model_N) && this.model_N.equals(obj.model_M) &&
                    this.root_M.equals(obj.root_N) && this.root_N.equals(obj.root_M));
    }
}
// BODY
let tale = [];
function main(model_A, model_B) {
    tale = [];
    let result = checkBisimilarity(model_A, model_A.states[0], model_B, model_B.states[0], [], 0);
    return { result: result, tale: tale };
}
function checkBisimilarity(model_M, root_M, model_N, root_N, visits, depth) {
    // preamble...
    let this_visit = new visit(model_M, model_N, root_M, root_N);
    if (hasAlreadyBeenVisited(this_visit, visits)) {
        tale.push(getDepthAsTabs(depth) +
            getBisimilarityName(model_M, model_N, root_M, root_N) +
            " checado acima!");
        tale.push(getDepthAsTabs(depth) + "✓");
        return true;
    }
    visits.push(this_visit);
    //~~STEP 1~~
    root_M.values.sort();
    root_N.values.sort();
    if (root_M.values.length != root_N.values.length) {
        return false;
    }
    for (let index in root_M.values) {
        if (root_M.values[index] != root_N.values[index]) {
            tale.push(getDepthAsTabs(depth) + "<b>1.</b> " + root_M.name + " e " + root_N.name + " não têm os mesmos valores!");
            tale.push(getDepthAsTabs(depth) + "&nbsp;&nbsp;&nbsp;X");
            return false;
        }
    }
    tale.push(getDepthAsTabs(depth) + "<b>1.</b> " + root_M.name + " e " + root_N.name + " têm os mesmos valores!");
    //=========
    let root_M_targets = getStateTargets(root_M, model_M);
    let root_N_targets = getStateTargets(root_N, model_N);
    //~~STEP 2~~
    tale.push(getDepthAsTabs(depth) + "<b>2.</b> vizinhos de " + root_M.name + ": {" + root_M_targets.toString() + "}");
    tale.push(getDepthAsTabs(depth) + "&nbsp;&nbsp;&nbsp;vizinhos de " + root_N.name + ": {" + root_N_targets.toString() + "}");
    let step_2_result = checkBisimilarityOfTargets(model_M, root_M, root_M_targets, model_N, root_N, root_N_targets, visits, depth + 1);
    if (step_2_result == false) {
        return false;
    }
    //=========
    //~~STEP 3~~
    tale.push(getDepthAsTabs(depth) + "<b>3.</b> vizinhos de " + root_N.name + ": {" + root_N_targets.toString() + "}");
    tale.push(getDepthAsTabs(depth) + "&nbsp;&nbsp;&nbsp;vizinhos de " + root_M.name + ": {" + root_M_targets.toString() + "}");
    let step_3_result = checkBisimilarityOfTargets(model_N, root_N, root_N_targets, model_M, root_M, root_M_targets, visits, depth + 1);
    if (step_3_result == false) {
        return false;
    }
    //=========
    tale.push(getDepthAsTabs(depth) + "✓");
    return true;
}
function checkBisimilarityOfTargets(model_M, root_M, root_M_targets, model_N, root_N, root_N_targets, visits, depth) {
    for (let target_M of root_M_targets) {
        depth += 1;
        let exists_w = false;
        for (let target_N of root_N_targets) {
            tale.push(getDepthAsTabs(depth) + "- " + getBisimilarityName(model_M, model_N, target_M, target_N) + " ?");
            if (checkBisimilarity(model_M, target_M, model_N, target_N, visits, depth + 1)) {
                exists_w = true;
                break;
            }
        }
        if (!exists_w) {
            tale.push(getDepthAsTabs(depth) + " X");
            return false;
        }
        depth -= 1;
    }
    tale.push(getDepthAsTabs(depth) + " ✓");
    return true;
}
function getStateTargets(state, model) {
    return model.transitions
        .filter((f) => f.source == state.name)
        .map((f) => model.getStateByName(f.target));
}
function hasAlreadyBeenVisited(this_visit, visits) {
    return visits.find((f) => f.equals(this_visit)) != undefined;
}
// VISUALIZATION HELPERS
function getBisimilarityName(model_M, model_N, root_M, root_N) {
    return model_M.name.toUpperCase() + root_M.name + " ≈ " +
        model_N.name.toUpperCase() + root_N.name;
}
function getDepthAsTabs(depth) {
    return "&nbsp;".repeat(depth * 2);
}
let model_M_json = {
    "states": [
        {
            "name": "w",
            "values": ["p"]
        }
    ],
    "transitions": [
        { "source": "w", "target": "w" }
    ]
};
let model_N_json = {
    "states": [
        {
            "name": "v1",
            "values": ["p"]
        },
        {
            "name": "v2",
            "values": ["p"]
        }
    ],
    "transitions": [
        { "source": "v1", "target": "v2" },
        { "source": "v2", "target": "v1" }
    ]
};
let model_M;
let model_N;
function updateModelsSpan(model_M_string, model_N_string) {
    document.getElementById('model_M').value = model_M_string;
    document.getElementById('model_N').value = model_N_string;
}
function updateModels(index) {
    switch (index) {
        case 0:
            model_M_json = JSON.parse(document.getElementById("model_M").value);
            model_M = new model('M', model_M_json.states.map((f) => new state(f.name, f.values)), model_M_json.transitions.map((f) => new transition(f.source, f.target)));
            updateModelVisualization(0, model_M);
            break;
        case 1:
            model_N_json = JSON.parse(document.getElementById("model_N").value);
            model_N = new model('N', model_N_json.states.map((f) => new state(f.name, f.values)), model_N_json.transitions.map((f) => new transition(f.source, f.target)));
            updateModelVisualization(1, model_N);
            break;
    }
}
function updateModelVisualization(index, model) {
    let txt = "graph TD\n";
    model.transitions.forEach((transition) => {
        let source = model.getStateByName(transition.source);
        let target = model.getStateByName(transition.target);
        txt += "    " + source + "[\"" + getStateLabel(source) + "\"] --> " + target.name + "[\"" + getStateLabel(target) + "\"]\n";
    });
    var element = document.getElementById('graph_visualization_model_' + index);
    element.innerHTML = txt;
    element.removeAttribute('data-processed');
    mermaid.init(undefined, "#graph_visualization_model_" + index);
}
function getStateLabel(state) {
    var string = "<b>" + state.name + "</b>: (";
    for (var i = 0; i < state.values.length; i++) {
        string += state.values[i];
        if (i < state.values.length - 1)
            string += ", ";
    }
    string += ")";
    return string;
}
function runAlgorithm() {
    let algorithmResult = main(model_M, model_N);
    let txt = "";
    if (algorithmResult.result) {
        txt = "✓ ";
    }
    else {
        txt = "✗ ";
    }
    txt += algorithmResult.result + "!";
    txt += "<br><br><b>Execution tale</b>:<br><br>";
    let tale = algorithmResult.tale.join("<br>");
    txt += tale;
    document.getElementById("execution_tale").innerHTML = txt;
}
function loadExample(index) {
    let examples = [
        [
            '{"states":[{"name":"w","values":["p"]}],"transitions":[{"source":"w","target":"w"}]}',
            '{"states":[{"name":"v1","values":["p"]},{"name":"v2","values":["p"]}],"transitions":[{"source":"v1","target":"v2"},{"source":"v2","target":"v1"}]}'
        ],
        [
            '{"states":[{"name":"w","values":["p"]}],"transitions":[{"source":"w","target":"w"}]}',
            '{"states":[{"name":"v1","values":["p"]},{"name":"v2","values":["p"]}],"transitions":[{"source":"v1","target":"v2"}]}'
        ],
        [
            '{"states":[{"name":"w1","values":["p"]},{"name":"w2","values":["p"]}],"transitions":[{"source":"w1","target":"w2"}]}',
            '{"states":[{"name":"v1","values":["p"]},{"name":"v2","values":["p"]},{"name":"v3","values":["p"]}],"transitions":[{"source":"v1","target":"v2"},{"source":"v1","target":"v3"}]}'
        ],
        [
            '{"states":[{"name":"w1","values":["p"]},{"name":"w2","values":["p"]}],"transitions":[{"source":"w1","target":"w2"}]}',
            '{"states":[{"name":"v1","values":["p"]},{"name":"v2","values":["p"]},{"name":"v3","values":["p"]}],"transitions":[{"source":"v1","target":"v2"},{"source":"v2","target":"v3"}]}'
        ],
        [
            '{"states":[{"name":"r1","values":["p"]},{"name":"r2","values":["q"]},{"name":"r3","values":["m"]},{"name":"r4","values":["n"]}],"transitions":[{"source":"r1","target":"r2"},{"source":"r2","target":"r3"},{"source":"r2","target":"r4"}]}',
            '{"states":[{"name":"s1","values":["p"]},{"name":"s2","values":["q"]},{"name":"s3","values":["q"]},{"name":"s4","values":["m"]},{"name":"s5","values":["n"]}],"transitions":[{"source":"s1","target":"s2"},{"source":"s1","target":"s3"},{"source":"s2","target":"s4"},{"source":"s3","target":"s5"}]}'
        ]
    ];
    updateModelsSpan(JSON.stringify(JSON.parse(examples[index][0]), null, 4), JSON.stringify(JSON.parse(examples[index][1]), null, 4));
    updateModels(0);
    updateModels(1);
    cleanResults();
}
function cleanResults() {
    document.getElementById("execution_tale").textContent = "";
}
