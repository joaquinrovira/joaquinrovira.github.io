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