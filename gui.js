// Da media vuelta, esto es un desastre.
// Pero funciona

// TO DO:
//          - Fix Variable and Preset classes sharing references to the value -- Note: WTF is up with primitive types being passed by reference??

let ctx,
    width,
    height;

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
    constructor(menus, cntx, wdth, hght) {
        this.menus = [];
        this.toggle = new GuiToggle();

        ctx = cntx;
        width = wdth;
        height = hght;
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

module.exports = Gui;