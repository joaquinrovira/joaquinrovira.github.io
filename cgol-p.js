// TODO: Limit particle amount

let canvas, width, height, ctx;
let objects = [];
let keysDown = {};
let parameters;
let variables = {maxPartcls: 200, stepSpeed: 1};

window.onload = () => {
    canvas = document.createElement('canvas');
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height - 4;
    ctx = canvas.getContext('2d');

    document.body.appendChild(canvas);
    setup();
    window.requestAnimationFrame(step);
};

function step() {
    for(i = 0; i < variables.stepSpeed; i++) update();
    render();
    window.requestAnimationFrame(step);
}

function update() {
    objects.forEach(e => {
        e.update();
    });
}

function render() {
    objects.forEach(e => {
        e.render();
    });
}

function setupParticles() {// Used in setup() and onNewParameters event
    let particles = new ParticleArray();

    let types = parameters.types;
    let typesArray = [];
    for (let i = 0; i < types; i++) {
        typesArray.push(`hsl(${Math.round(Math.random() * 360)},50%,35%)`);
    }
    particles.types = typesArray;
    let relations = {};

    let varF = parameters.varF,
        meanF = parameters.meanF;

    let maxMaxR = parameters.maxMaxR,
        minMaxR = parameters.minMaxR;
    let maxMinR = parameters.maxMinR,
        minMinR = parameters.minMinR;

    typesArray.forEach(element => {
        relations[element] = {};
        typesArray.forEach(e => {
            relations[element][e] = {};
            relations[element][e].force = Math.random() * varF + meanF;
            relations[element][e].minR = Math.random() * (maxMinR - minMinR) + minMinR;
            relations[element][e].maxR = Math.random() * (maxMaxR - minMaxR) + minMaxR;
        });
    });

    particles.relations = relations;

    let separation = parameters.separation;
    let sp = separation;
    let maxParticles = variables.maxPartcls;
    let i, j, iMax = width - separation, jMax = height - separation;
    let actualParticles = (width - 2 * separation) * (height - 2 * separation) / (separation * separation);
    if (actualParticles > maxParticles) {
        sp = (2 * (width + height) - Math.sqrt(2 * (width + height) * 2 * (width + height) - 16 * (width * height - maxParticles * separation * separation))) / 8;
        iMax = width - sp;
        jMax = height - sp;
    }

    for (i = sp; i < iMax; i += separation) {
        for (j = sp; j < jMax; j += separation) {
            particles.push(new Particle(i, j, typesArray[Math.floor(Math.random() * typesArray.length)]));
        }
    }
    particles.particles[0].dy = 1;
    particles.particles[0].dx = 1;
    objects[1] = particles;
}

function setup() {
    let bkg = new Background('#000000');
    objects.push(bkg);

    let presets = {
        type: 'preset',
        smallFish: { friction: 0.04, meanF: -0.04, varF: 0.12, maxMaxR: 70, minMaxR: 20, maxMinR: 20, minMinR: 6, types: 10, separation: 65 },
        largeFish: { friction: 0.2, meanF: -0.1, varF: 0.3, maxMaxR: 100, minMaxR: 30, maxMinR: 30, minMinR: 6, types: 10, separation: 50 },
        largeFish2: { friction: 0.2, meanF: -0.1, varF: 0.3, maxMaxR: 100, minMaxR: 30, maxMinR: 30, minMinR: 6, types: 5, separation: 50 },
        chaos: { friction: 0.02, meanF: -0.1, varF: 0.3, maxMaxR: 100, minMaxR: 15, maxMinR: 15, minMinR: 6, types: 10, separation: 50 }
    };
    parameters = presets.largeFish;

    setupParticles();

    let gui = new Gui({
        Variables: {
            type: 'value',
            friction: { min: 0, max: 1, current: parameters.friction },
            meanF: { min: -1, max: 1, current: parameters.meanF },
            varF: { min: 0, max: 1, current: parameters.varF },
            maxMaxR: { min: 0, max: 100, current: parameters.maxMaxR },
            minMaxR: { min: 0, max: 100, current: parameters.minMaxR },
            maxMinR: { min: 0, max: 100, current: parameters.maxMinR },
            minMinR: { min: 0, max: 100, current: parameters.minMinR },
            types: { min: 1, max: 10, current: parameters.types },
            separation: { min: 10, max: 100, current: parameters.separation }
        },
        Presets: presets,
        Rendering: {
            type: 'value',
            maxPartcls: { min: 10, max: 500, current: variables.maxPartcls },
            stepSpeed: { min: 0, max: 10, current: variables.stepSpeed }
        }
    }, ctx, width, height);
    addEventListener('onNewParameters', (e) => {
        let setupP = true;
        if (e.detail.name) {// Single parameter change
            if (e.detail.name in parameters) parameters[e.detail.name] = e.detail.value;
            else {
                variables[e.detail.name] = e.detail.value;
                setupP = false;
            }
        } else if (e.detail.values) {// Full preset list
            parameters = Object.assign({}, e.detail.values);
        } else throw 'Invalid new parameters.';
        if(setupP) setupParticles();
    });

    objects.push(gui);
}