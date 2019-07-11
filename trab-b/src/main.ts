// DEFINITIONS

class state {
    name: string;
    values: string[];

    constructor(name: string, values: string[]) {
        this.name = name;
        this.values = values;
    }

    public equals(obj: state) {
        return this.name == obj.name;
    }

    public toString = () : string => { return this.name; }
}

class transition {
    source: string;
    target: string;

    constructor(source: string, target: string) {
        this.source = source;
        this.target = target;
    }
}

class model {
    name: string;
    states: state[];
    transitions: transition[];

    constructor(name: string, states: state[], transitions: transition[]) {
        this.name = name;
        this.states = states;
        this.transitions = transitions;
    }

    public equals(obj: model): boolean {
        return this.name == obj.name;
    }

    public getStateByName(name: string): state {
        return this.states.find((s) => s.name == name);
    }
}

class visit {
    model_M: model;
    model_N: model;
    root_M: state;
    root_N: state;
    
    constructor (model_M: model, model_N: model, root_M: state, root_N: state) {
        this.model_M = model_M;
        this.model_N = model_N;
        this.root_M = root_M;
        this.root_N = root_N;
    }

    public equals(obj: visit): boolean {
        return (this.model_M.equals(obj.model_M) && this.model_N.equals(obj.model_N) &&
                this.root_M.equals(obj.root_M)   && this.root_N.equals(obj.root_N))
                ||
                (this.model_M.equals(obj.model_N) && this.model_N.equals(obj.model_M) &&
                this.root_M.equals(obj.root_N)    && this.root_N.equals(obj.root_M));
    }
}

// BODY

let tale: string[] = [];

function main(model_A: model, model_B: model): any {
    tale = [];

    let result = checkBisimilarity(model_A, model_A.states[0], model_B, model_B.states[0], [], 0);

    return {result: result, tale: tale};
}

function checkBisimilarity(
    model_M: model, root_M: state,
    model_N: model, root_N: state,
    visits: visit[], depth: number): boolean {
    
    // preamble...
    let this_visit: visit = new visit(model_M, model_N, root_M, root_N);
    if (hasAlreadyBeenVisited(this_visit, visits)) {
        tale.push(
            getDepthAsTabs(depth) + 
            getBisimilarityName(model_M, model_N, root_M, root_N) + 
            " checado acima!");
        tale.push(
            getDepthAsTabs(depth) + "✓"
        )
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

    let root_M_targets: state[] = getStateTargets(root_M, model_M);
    let root_N_targets: state[] = getStateTargets(root_N, model_N);
    
    //~~STEP 2~~
    
    tale.push(getDepthAsTabs(depth) + "<b>2.</b> vizinhos de " + root_M.name + ": {" + root_M_targets.toString() + "}")
    tale.push(getDepthAsTabs(depth) + "&nbsp;&nbsp;&nbsp;vizinhos de " + root_N.name + ": {" + root_N_targets.toString() + "}")
    let step_2_result: boolean = checkBisimilarityOfTargets(
        model_M, root_M, root_M_targets,
        model_N, root_N, root_N_targets,
        visits, depth + 1);
    if (step_2_result == false) {
        return false;
    }
    
    //=========

    //~~STEP 3~~
    
    tale.push(getDepthAsTabs(depth) + "<b>3.</b> vizinhos de " + root_N.name + ": {" + root_N_targets.toString() + "}")
    tale.push(getDepthAsTabs(depth) + "&nbsp;&nbsp;&nbsp;vizinhos de " + root_M.name + ": {" + root_M_targets.toString() + "}")
    let step_3_result: boolean = checkBisimilarityOfTargets(
        model_N, root_N, root_N_targets,
        model_M, root_M, root_M_targets,
        visits, depth + 1);
    if (step_3_result == false) {
        return false;
    }
    
    //=========

    tale.push(getDepthAsTabs(depth) + "✓");
    return true;
}

function checkBisimilarityOfTargets(
    model_M: model, root_M: state, root_M_targets: state[],
    model_N: model, root_N: state, root_N_targets: state[],
    visits: visit[], depth: number): boolean {

    for (let target_M of root_M_targets) {
        depth += 1;
        let exists_w: boolean = false;
        for (let target_N of root_N_targets) {
            tale.push(getDepthAsTabs(depth) + "- " + getBisimilarityName(model_M, model_N, target_M, target_N) + " ?");
            if (checkBisimilarity(model_M, target_M, model_N, target_N, visits, depth + 1)) {
                exists_w = true;
                break;
            }
        }
        if (!exists_w) {
            tale.push(getDepthAsTabs(depth) + " X")
            return false;
        }
        depth -= 1;
    }

    tale.push(getDepthAsTabs(depth) + " ✓");
    return true;
}

function getStateTargets(state: state, model: model): state[] {
    return model.transitions
        .filter((f) => f.source == state.name)
        .map((f) => model.getStateByName(f.target));
}

function hasAlreadyBeenVisited(this_visit: visit, visits: visit[]): boolean {
    return visits.find((f) => f.equals(this_visit)) != undefined;
}

// VISUALIZATION HELPERS

function getBisimilarityName(model_M: model, model_N: model, root_M: state, root_N: state): string {
    return model_M.name.toUpperCase() + root_M.name + " ≈ " + 
        model_N.name.toUpperCase() + root_N.name;
}

function getDepthAsTabs(depth: number): string {
    return "&nbsp;".repeat(depth*2);
}

let model_M_json = {
    "states": [
        {
            "name": "w",
            "values": ["p"]
        }
    ],
    "transitions": [
        {"source": "w", "target": "w"}
    ]
}

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
        {"source": "v1", "target": "v2"},
        {"source": "v2", "target": "v1"}
    ]
}

let model_M: model;
let model_N: model;

function updateModelsSpan(model_M_string: string, model_N_string: string) {
    document.getElementById('model_M').value = model_M_string;
    document.getElementById('model_N').value = model_N_string;
}

function updateModels(index: number) {
    switch (index) {
        case 0:
            model_M_json = JSON.parse(document.getElementById("model_M").value);
            model_M = new model(
                'M',
                model_M_json.states.map((f) => new state(f.name, f.values)),
                model_M_json.transitions.map((f) => new transition(f.source, f.target))        
            );
            updateModelVisualization(0, model_M);
            break;
        case 1:
            model_N_json = JSON.parse(document.getElementById("model_N").value);
            model_N = new model(
                'N',
                model_N_json.states.map((f) => new state(f.name, f.values)),
                model_N_json.transitions.map((f) => new transition(f.source, f.target))        
            );
            updateModelVisualization(1, model_N);
            break;
    }
}

function updateModelVisualization(index: number, model: model) {
    let txt: string = "graph TD\n";
    
    model.transitions.forEach((transition) => {
        let source: state = model.getStateByName(transition.source);
        let target: state = model.getStateByName(transition.target);

        txt += "    " + source + "[\"" + getStateLabel(source) + "\"] --> " + target.name + "[\"" + getStateLabel(target) + "\"]\n"
    });

    var element = document.getElementById('graph_visualization_model_' + index);
    element.innerHTML = txt;
    element.removeAttribute('data-processed');
    mermaid.init(undefined, "#graph_visualization_model_" + index);
}

function getStateLabel(state: state): string {
    var string = "<b>" + state.name + "</b>: ("

    for (var i = 0; i < state.values.length; i++) {
        string += state.values[i];
        if (i < state.values.length - 1) string += ", ";
    }

    string += ")";
    return string;
}

function runAlgorithm(): void {
    let algorithmResult = main(model_M, model_N);
    
    let txt: string = "";

    if (algorithmResult.result) {
        txt = "✓ "
    } else {
        txt = "✗ "
    }
    txt += algorithmResult.result + "!";

    txt += "<br><br><b>Execution tale</b>:<br><br>";

    let tale: string = algorithmResult.tale.join("<br>");
    txt += tale;

    document.getElementById("execution_tale").innerHTML = txt;
}

function loadExample(index: number) {
    let examples: string[][] = [
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
    ]

    updateModelsSpan(
        JSON.stringify(JSON.parse(examples[index][0]), null, 4),
        JSON.stringify(JSON.parse(examples[index][1]), null, 4));
    updateModels(0);
    updateModels(1);
    cleanResults();
}

function cleanResults() {
    document.getElementById("execution_tale").textContent = "";
}