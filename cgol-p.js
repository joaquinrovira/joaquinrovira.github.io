const Gui = require('./gui.js');

let canvas, width, height, ctx;
let objects = [];
let keysDown = {};
const smallFish = { friction: 0.04, meanF: -0.04, varF: 0.12, maxMaxR: 70, minMaxR: 20, maxMinR: 20, minMinR: 0, types: 10, separation: 65 };
let parameters = smallFish;

window.once('dom-ready', () => {
    canvas = document.createElement('canvas');
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');

    document.body.appendChild(canvas);
    setup();
    window.requestAnimationFrame(step);
});

function step() {
    update();
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

class Background {
    constructor(colour) {
        this.colour = colour;
    }
    update() { }
    render() {
        ctx.fillStyle = this.colour;
        ctx.fillRect(0, 0, width, height);
    }
    collides(particle) {

    }
}

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;

        this.dx = 0;
        this.dy = 0;

        this.type = type;
        this.size = 5;
    }
    update() {
        objects[1].forEach(e => {
            let dx = e.x - this.x;
            let dy = e.y - this.y;
            let f = 0;

            let r2 = dx * dx + dy * dy;
            let minR = objects[1].relations[this.type][e.type].minR;
            let maxR = objects[1].relations[this.type][e.type].maxR;
            if (r2 > maxR * maxR || r2 < 0.01) return;

            let r = Math.sqrt(r2);
            dx /= r;
            dy /= r;

            if (r > minR) {
                let numer = 2 * Math.abs(r - 0.5 * (maxR + minR));
                let denom = maxR - minR;
                f = objects[1].relations[this.type][e.type].force * (1 - numer / denom);
            } else {
                f = 2 * minR * (1.0 / (minR + 2) - 1 / (r + 1));
            }
            this.dx += f * dx;
            this.dy += f * dy;
        });

        this.x += this.dx;
        this.y += this.dy;
        this.dx *= 1 - objects[1].friction;
        this.dy *= 1 - objects[1].friction;

        // Wrap around particles
        /*
        if(this.x < 0) this.x = width;
        else if (this.x > width) this.x = 0;
        if(this.y < 0) this.y = height;
        else if (this.y > height) this.y = 0;
        */

        //Bounce off wall
        if (this.x < 0 + this.size) {
            this.x = this.size;
            this.dx = -this.dx;
        } else if (this.x > width - this.size) {
            this.x = width - this.size;
            this.dx = -this.dx;
        }
        if (this.y < 0 + this.size) {
            this.y = this.size;
            this.dy = -this.dy;
        } else if (this.y > height - this.size) {
            this.y = height - this.size;
            this.dy = -this.dy;
        }
    }
    render() {
        ctx.fillStyle = this.type;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, 2 * Math.PI);
        ctx.fill();
    }
    distance(particle) {
        return Math.pow(particle.x - this.x, 2) + Math.pow(particle.y - this.y, 2);
    }
    force() {
    }
    friction() {
    }
}

class ParticleArray {
    constructor() {
        this.particles = [];
        this.types = null;
        this.relations = null;

        this.friction = parameters.friction;
    }
    update() {
        this.particles.forEach(e => {
            e.update();
        });
    }
    render() {
        this.particles.forEach(e => {
            e.render();
        });
    }
    push(e) {
        this.particles.push(e);
    }
    forEach(func) {
        this.particles.forEach(e => func(e));
    }
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
    for (let i = separation; i < width - separation; i += separation) {
        for (let j = separation; j < height - separation; j += separation) {
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

    setupParticles();

    let gui = new Gui({
        Variables: {
            type: 'value',
            friction:   { min: 0,  max: 1,   current: 0.04 },
            meanF:      { min: -1, max: 1,   current: -0.04 },
            varF:       { min: 0,  max: 1,   current: 0.12 },
            maxMaxR:    { min: 0,  max: 100, current: 70 },
            minMaxR:    { min: 0,  max: 100, current: 20 },
            maxMinR:    { min: 0,  max: 100, current: 20 },
            minMinR:    { min: 0,  max: 100, current: 6 },
            types:      { min: 1,  max: 10,  current: 10 },
            separation: { min: 10, max: 100, current: 65 }
        },
        Presets: {
            type: 'preset',
            smallFish:  { friction: 0.04, meanF: -0.04,  varF: 0.12, maxMaxR: 70,  minMaxR: 20, maxMinR: 20, minMinR: 6, types: 10, separation: 65 },
            largeFish:  { friction: 0.2,  meanF: -0.1,   varF: 0.3,  maxMaxR: 100, minMaxR: 30, maxMinR: 30, minMinR: 6, types: 10, separation: 50 },
            largeFish2: { friction: 0.2,  meanF: -0.1,   varF: 0.3,  maxMaxR: 100, minMaxR: 30, maxMinR: 30, minMinR: 6, types: 5,  separation: 50 },
            chaos:      { friction: 0.02, meanF: -0.1,   varF: 0.3, maxMaxR: 100,  minMaxR: 15, maxMinR: 15, minMinR: 6, types: 10,  separation: 50 }
        }
    }, ctx, width, height);
    addEventListener('onNewParameters', (e) => {
        if(e.detail.name) {// Single parameter change
            parameters[e.detail.name] = e.detail.value;
        } else if(e.detail.values) {// Full preset list
            parameters = Object.assign({}, e.detail.values);
        } else throw 'Invalid new parameters.';
        setupParticles();
    });

    objects.push(gui);
}