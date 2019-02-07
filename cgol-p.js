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

let textColour = '#777777',
    separatorColour = '#444444',

    elementBackground = '#171717',
    elementHighlight = '#333333',
    elementWidth = 200,
    elementHeight = 35,
    elementTextSize = 12,

    valueMargin = 6,
    valueBackground = '#222222',
    valueHighlight = '#272727',
    valueWidth = elementWidth - 2 * valueMargin,
    valueHeight = elementHeight,
    valueTextSize = 10,
    valueNameSpace = 1 / 3,
    valueBoxSpace = 1 / 2,
    valueValueSpace = 1 / 6,
    valueBoxBackground = '#111111',
    valueBoxForeground = '#444477',

    menuToggleWidth = elementWidth / 2,
    menuToggleHeight = elementHeight / 1.5,
    menuToggleRaius = 7,
    menuToggleMargin = 7,
    menuX,
    menuY = 0,

    mc = 0;// This should really be somewhere else on the scope of the script

var gui;

/*
** Examle menu **
{
    Variables: {
        type: 'value',
        friction:   { min: 0, max: 1, current: 0.04 },
        meanF:      { min: -1, max: 1, current: -0.04 },
        varF:       { min: 0, max: 1, current: 0.12 },
        maxMaxR:    { min: 0, max: 100, current: 70 },
        minMaxR:    { min: 0, max: 100, current: 20 },
        maxMinR:    { min: 0, max: 100, current: 20 },
        minMinR:    { min: 0, max: 100, current: 6 },
        types:      { min: 1, max: 10, current: 10 },
        separation: { min: 10, max: 100, current: 65 }
    },
    Presets: {
        type: 'preset',
        smallFish:  { friction: 0.04, meanF: -0.04, varF: 0.12, maxMaxR: 70, minMaxR: 20, maxMinR: 20, minMinR: 6, types: 10, separation: 65 },
        largeFish:  { friction: 0.2, meanF: -0.1, varF: 0.3, maxMaxR: 100, minMaxR: 30, maxMinR: 30, minMinR: 6, types: 10, separation: 50 },
        largeFish2: { friction: 0.2, meanF: -0.1, varF: 0.3, maxMaxR: 100, minMaxR: 30, maxMinR: 30, minMinR: 6, types: 5, separation: 50 },
        slowStart:  { friction: 0.04, meanF: -0.075, varF: 0.15, maxMaxR: 60, minMaxR: 15, maxMinR: 15, minMinR: 6, types: 5, separation: 50 }
    }
}
*/

class Gui {
    constructor(menus) {
        this.menus = [];
        this.toggle = new GuiToggle();
        
        menuX = width - elementWidth - 12;
        gui = this;

        Object.keys(menus).forEach(e => {
            let values = menus[e];

            this.menus.push(new Menu(e, values));
        });

        window.addEventListener('click', gui.onClick);
        window.addEventListener('mousemove', gui.onMouseMove);
        window.addEventListener('mousedown', gui.onMouseDown);
        window.addEventListener('mouseup', gui.onMouseUp);
    }

    update() { }

    render() {
        let drawY = menuY;
        if (this.toggle.state) {
            // draw menus
            this.menus.forEach(menu => {
                drawY = menu.render(drawY);
            });
        }
        this.toggle.render(drawY);
    }

    onClick(evt) {
        let x = evt.clientX,
            y = evt.clientY,
            dy = 0;

        if (gui.toggle.state)
            for (let i = 0; i < gui.menus.length; i++) {
                dy = gui.menus[i].onClick(x, y, dy);
                if (dy === -1) return;
            }
        gui.toggle.onClick(x, y, dy);
    }

    onMouseMove(evt) {
        let x = evt.clientX,
            y = evt.clientY,
            dy = 0;
        mc = 0;// Mouse changed

        if (gui.toggle.state)
            for (let i = 0; i < gui.menus.length; i++) {
                dy = gui.menus[i].onMouseMove(x, y, dy);
            }
        gui.toggle.onMouseMove(x, y, dy);
        if (!mc) ctx.canvas.style.cursor = 'default';
    }

    // Only Values care about mouse down, in order to udate value box on mouse move or release
    onMouseDown(evt) {
        let x = evt.clientX,
            y = evt.clientY,
            dy = 0;
        
        if(gui.toggle.state)
            for(let i = 0; i < gui.menus.length; i++) {
                dy = gui.menus[i].onMouseDown(x, y, dy);
                if (dy === -1) break;
            }
    }

    onMouseUp(evt) {
        let x = evt.clientX;

        gui.menus.forEach(e => {
            e.onMouseUp(x);
        });
    }

    updateValues(values) {
        this.menus.forEach(e => {
            e.updateValues(values);
        });
    }
}

class GuiToggle {
    constructor() {
        this.state = true;
        this.colour = elementBackground;
    }

    render(drawY) {
        let drawX = menuX + (elementWidth - menuToggleWidth) / 2;
        drawY += menuToggleMargin;
        roundedRectangle(drawX, drawY, menuToggleWidth, menuToggleHeight, menuToggleRaius, this.colour);

        ctx.font = `${elementTextSize}px Arial`;
        ctx.fillStyle = textColour;
        ctx.textAlign = "center";
        ctx.fillText(this.state ? 'Close' : 'Open', drawX + menuToggleWidth / 2, drawY + menuToggleHeight / 2 + elementTextSize / 3);
    }

    onClick(x, y, dy) {
        if (this.inside(x, y, dy)) {
            this.state = !this.state;
            this.colour = elementBackground;
        }
        return;
    }

    onMouseMove(x, y, dy) {
        if (this.inside(x, y, dy)) {
            this.colour = elementHighlight;
            mc = 1;
            ctx.canvas.style.cursor = 'pointer';
        }
        else this.colour = elementBackground;

        return;
    }

    inside(x, y, dy) {
        return x > menuX + (elementWidth - menuToggleWidth) / 2 && x < menuX + (elementWidth - menuToggleWidth) / 2 + menuToggleWidth &&
                y > menuY + dy + menuToggleMargin && y < menuY + dy + menuToggleMargin + menuToggleHeight;
    }
}

class Menu {
    constructor(name, values) {
        this.name = name;
        this.values = [];
        this.state = false;
        this.colour = elementBackground;

        let keys = Object.keys(values);
        let type = values[keys.shift()];
        if(type === 'value')
            keys.forEach(e => {
                let min = values[e].min;
                let max = values[e].max;
                let current = values[e].current;
    
                this.values.push(new Value(e, min, max, current));
            });
        else if(type === 'preset')
            keys.forEach(e => {
                this.values.push(new Preset(e, values[e]));
            });
        else throw "InvalidMenuException";

    }

    render(drawY) {

        // Draw item
        ctx.fillStyle = this.colour;
        ctx.fillRect(menuX, drawY, elementWidth, elementHeight);
        ctx.font = `${elementTextSize}px Arial`;
        ctx.textAlign = "start";
        ctx.fillStyle = textColour;
        ctx.fillText(`${this.state ? '\u2B9F' : '\u2B9E'} ${this.name}`, menuX + 12, drawY + elementHeight / 2 + elementTextSize / 3);

        // Increase drawCoords
        drawY += elementHeight;

        // Draw separator
        drawSeparator(drawY, 0);

        if (this.state)
            this.values.forEach(e => {
                drawY = e.render(drawY);
            });

        return drawY;
    }

    onClick(x, y, dy) {
        if (this.inside(x, y, dy)) {// Check in menu
            this.state = !this.state;
            return -1;
        }
        dy += elementHeight;

        if (this.state)
            for (let i = 0; i < this.values.length; i++) {
                dy = this.values[i].onClick(x, y, dy);
                if (dy === -1) break;
            }
        return dy;
    }

    onMouseMove(x, y, dy) {
        if (this.inside(x, y, dy)) {// Check in menu
            this.colour = elementHighlight;
            mc = 1;
            ctx.canvas.style.cursor = 'pointer';
        }
        else this.colour = elementBackground;
        dy += elementHeight;

        if (this.state)
            for (let i = 0; i < this.values.length; i++) {
                dy = this.values[i].onMouseMove(x, y, dy);
            }
        return dy;
    }

    onMouseDown(x, y, dy) {
        if (this.inside(x, y, dy)) {// Check in menu
            return -1;
        }
        dy += elementHeight;

        if (this.state)
            for (let i = 0; i < this.values.length; i++) {
                dy = this.values[i].onMouseDown(x, y, dy);
                if (dy === -1) break;
            }
        return dy;
    }

    onMouseUp(x) {
        this.values.forEach(e => {
            e.onMouseUp(x);
        });
    }

    inside(x, y, dy) {
        return x >= menuX && x <= menuX + elementWidth && y >= menuY + dy && y <= menuY + dy + elementHeight;
    }

    updateValues(values) {
        this.values.forEach(e => {
            if(e instanceof Preset) return;
            else e.updateValues(values);
        });
    }
}

class Value {
    constructor(name, min, max, current) {
        this.name = name;
        this.min = min;
        this.max = max;
        this.current = current;
        this.colour = valueBackground;
        this.state = false;
    }

    render(drawY) {
        /**
         * |---1/3---||-------1/2-------||---1/6---|
         * +---------------------------------------+
         * |          +---------------+            |
         * |  TEXT    |          |    |    VALUE   |
         * |          +---------------+            |
         * +---------------------------------------+
         */

        // Base
        ctx.fillStyle = this.colour;
        ctx.fillRect(menuX + valueMargin, drawY, valueWidth, valueHeight);

        // Text
        ctx.font = `${valueTextSize}px Arial`;
        ctx.textAlign = "start";
        ctx.fillStyle = textColour;
        ctx.fillText(`${this.name}`, menuX + 12 + valueMargin, drawY + valueHeight / 2 + valueTextSize / 3, valueWidth * valueNameSpace);

        // Box
        // Box backround
        ctx.fillStyle = valueBoxBackground;
        ctx.fillRect(menuX + valueMargin + valueWidth * valueNameSpace + valueMargin, drawY + valueMargin, valueWidth * valueBoxSpace - 2 * valueMargin, valueHeight - 2 * valueMargin);
        // Box foreground will be a % of background - (1 - (this.max - this.current) / (this. max - this.min))
        ctx.fillStyle = valueBoxForeground;
        ctx.fillRect(menuX + valueMargin + valueWidth * valueNameSpace + valueMargin, drawY + valueMargin, (valueWidth * valueBoxSpace - 2 * valueMargin) * ((this.current - this.min) / (this.max - this.min)), valueHeight - 2 * valueMargin);// oof...

        // Value
        ctx.font = `${valueTextSize}px Arial`;
        ctx.textAlign = "start";
        ctx.fillStyle = textColour;
        ctx.fillText(`${Number(Math.round(this.current + 'e3') + 'e-3')}`, menuX + valueMargin + valueWidth * (valueNameSpace + valueBoxSpace), drawY + valueHeight / 2 + valueTextSize / 3, valueWidth * valueValueSpace - valueMargin);

        
        // Increase drawCoords
        drawY += valueHeight;

        // Draw separator
        drawSeparator(drawY, valueMargin);

        return drawY;
    }

    onClick(x, y, dy) {
        if (this.inside(x, y, dy)) {
            return -1;
        }
        return dy + valueHeight;
    }

    onMouseMove(x, y, dy) {
        if (this.inside(x, y, dy)) {
            this.colour = valueHighlight;

            if (this.insideBox(x, y, dy)) {
                mc = 1;
                ctx.canvas.style.cursor = 'ew-resize';
            }
        }
        else this.colour = valueBackground;

        if(this.state) {
            mc = 1;

            let pxb = menuX + 2 * valueMargin + valueWidth * valueNameSpace;// Left box side in absolute value
            let pxm = menuX + valueWidth * valueNameSpace + valueWidth * valueBoxSpace;// Right box side in absolute value
            let newVal = ((x - pxb) / (pxm - pxb)) * (this.max - this.min) + this.min;
            this.current = Math.max(this.min, Math.min(this.max, newVal));// Move newVal inside bounds
        }

        return dy + valueHeight;
    }

    onMouseDown(x, y, dy) {
        if (this.insideBox(x, y, dy)) {
                this.state = true;

                let pxb = menuX + 2 * valueMargin + valueWidth * valueNameSpace;// Left box side in absolute value
                let pxm = menuX + valueWidth * valueNameSpace + valueWidth * valueBoxSpace;// Right box side in absolute value
                let newVal = ((x - pxb) / (pxm - pxb)) * (this.max - this.min) + this.min;
                this.current = Math.max(this.min, Math.min(this.max, newVal));// Move newVal inside bounds
                return -1;
        }
        return dy + valueHeight;
    }

    onMouseUp(x) {
        if(this.state) { 
            // New parameters --> Restart simulation
            let evt = new CustomEvent('onNewParameters', {'detail': {name: this.name, value: this.current}});
            window.dispatchEvent(evt);
        }
        this.state = false;
    }

    inside(x, y, dy) {
        return x >= menuX + valueMargin && x <= menuX + valueMargin + valueWidth && y >= menuY + dy && y <= menuY + dy + valueHeight;
    }

    insideBox(x, y, dy) {
        return x >= menuX + 2 * valueMargin + valueWidth * valueNameSpace && x <= menuX + valueWidth * valueNameSpace + valueWidth * valueBoxSpace && 
                y >= menuY + dy + valueMargin && y <= menuY + dy + valueHeight - valueMargin;
    }

    updateValues(values) {
        let keys = Object.keys(values);
        let index = keys.indexOf(this.name);
        if(index !== -1) this.current = values[keys[index]];
    }
}

class Preset {
    constructor(name, values) {
        this.name = name;
        this.values = values;
        this.colour = valueBackground;
    }

    render(drawY) {

        // Base
        ctx.fillStyle = this.colour;
        ctx.fillRect(menuX + valueMargin, drawY, valueWidth, valueHeight);

        // Text
        ctx.font = `${valueTextSize}px Arial`;
        ctx.textAlign = "start";
        ctx.fillStyle = textColour;
        ctx.fillText(`${this.name}`, menuX + 12 + valueMargin, drawY + valueHeight / 2 + valueTextSize / 3);

        // Increase drawCoords
        drawY += valueHeight;

        // Draw separator
        drawSeparator(drawY, valueMargin);

        return drawY;
    }

    onClick(x, y, dy) {
        if (this.inside(x, y, dy)) {
            // ACTIVATE PRESET: Send event and update values in menu
            gui.updateValues(this.values);
            let evt = new CustomEvent('onNewParameters', {detail: {values: this.values}});
            window.dispatchEvent(evt);
            return -1;
        }
        return dy + valueHeight;
    }

    onMouseMove(x, y, dy) {
        if (this.inside(x, y, dy)) {
            this.colour = valueHighlight;
            mc = 1;
            ctx.canvas.style.cursor = 'pointer';
        }
        else this.colour = valueBackground;
        return dy + valueHeight;
    }

    onMouseDown(x, y, dy) {
        return dy + valueHeight;
    }

    onMouseUp(x) {}

    inside(x, y, dy) {
        return x >= menuX + valueMargin && x <= menuX + valueMargin + valueWidth && y >= menuY + dy && y <= menuY + dy + valueHeight
    }
}

function drawSeparator(drawY, margin) {
    drawY -= 1;
    ctx.strokeStyle = separatorColour;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(menuX + margin, drawY + 0.5);
    ctx.lineTo(menuX + elementWidth - margin, drawY + 0.5);
    ctx.stroke();
}

function roundedRectangle(x, y, width, height, r, colour) {
    ctx.fillStyle = colour;
    ctx.fillRect(x + r, y, width - 2 * r, height);
    ctx.fillRect(x, y + r, width, height - 2 * r);

    let cornerX,
        cornerY;

    // Top left corner
    cornerX = x + 0.5;
    cornerY = y + 0.5;
    ctx.beginPath();
    ctx.moveTo(cornerX + r, cornerY + r);
    ctx.lineTo(cornerX, cornerY + r);
    ctx.arcTo(cornerX, cornerY, cornerX + r, cornerY, r);
    ctx.fill();
    // Top right corner
    cornerX += width - 1;
    ctx.beginPath();
    ctx.moveTo(cornerX - r, cornerY + r);
    ctx.lineTo(cornerX, cornerY + r);
    ctx.arcTo(cornerX, cornerY, cornerX - r, cornerY, r);
    ctx.fill();
    // Bottom right corner
    cornerY += height - 1;
    ctx.beginPath();
    ctx.moveTo(cornerX - r, cornerY - r);
    ctx.lineTo(cornerX, cornerY - r);
    ctx.arcTo(cornerX, cornerY, cornerX - r, cornerY, r);
    ctx.fill();
    // Bottom left corner
    cornerX -= width - 1;
    ctx.beginPath();
    ctx.moveTo(cornerX + r, cornerY - r);
    ctx.lineTo(cornerX, cornerY - r);
    ctx.arcTo(cornerX, cornerY, cornerX + r, cornerY, r);
    ctx.fill();
}