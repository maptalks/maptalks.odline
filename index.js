import * as maptalks from 'maptalks';

function quadraticAt(p0, p1, p2, t) {
    const onet = 1 - t;
    return onet * (onet * p0 + 2 * t * p1) + t * t * p2;
}

const options = {
    'animation'     : false,
    'animationOnce' : false,
    'animationDuration' : 6000,
    'animationRandom'   : false,
    'curveness'     : 0,
    'trail'         : 20,
    'globalCompositeOperation' : 'lighter'
};

const defaultSymbol = {
    'lineColor' : '#000',
    'lineWidth' : 2
};

export class ODLineLayer extends maptalks.ParticleLayer {

    constructor(id, data, options) {
        if (data && !Array.isArray(data)) {
            data = [data];
        }
        super(id, options);
        this.setData(data);
    }

    getData() {
        return this._data;
    }

    setData(data) {
        this._data = data;
        delete this._endEventFired;
        if (this.getMap()) {
            this._prepareData();
            if (this._getRenderer()) {
                this._getRenderer().render();
            }
        }
        return this;
    }

    identify() {
        return null;
    }

    getParticles(t) {
        if (!this._animStartTime) {
            this._animStartTime = Date.now();
        }
        const map = this.getMap(),
            scale = map.getScale(),
            elapsed = t - this._animStartTime,
            duration = this.options['animationDuration'];
        if (this.options['animationOnce'] && elapsed > duration) {
            if (!this._endEventFired) {
                this._endEventFired = true;
                this.fire('animateend');
            }
            return [];
        }
        const symbol = this.options['symbol'] || defaultSymbol;
        let r = (elapsed % duration) / duration;
        const particles = [];
        let points, x, y, style;
        let p0, p1, cp;
        for (let i = 0, l = this._dataToDraw.length; i < l; i++) {
            if (this.options['animationRandom']) {
                r = ((t - this._animStartTime - this._dataToDraw[i]['time']) % duration) / duration;
                if (r < 0) {
                    r = 0;
                }
            }
            if (r > 0) {
                points = this._dataToDraw[i]['points'];
                style = this._data[i]['symbol'] || symbol;
                p0 = points[0];
                p1 = points[1];
                if (points[2]) {
                    cp = points[2];
                    x = quadraticAt(p0.x, cp.x, p1.x, r);
                    y = quadraticAt(p0.y, cp.y, p1.y, r);
                } else {
                    x = p0.x + r * (p1.x - p0.x);
                    y = p0.y + r * (p1.y - p0.y);
                }
                particles.push({
                    'point' : map._pointToContainerPoint(new maptalks.Point(x, y)._multi(1 / scale)),
                    'r'     : (style['lineWidth'] || 3) / 2,
                    'color' : style['lineColor']
                });
            }

        }
        return particles;
    }



    draw(ctx) {
        if (!this._dataToDraw) {
            this._prepareData();
        }
        if (this.options['animation']) {
            return super.draw.apply(this, arguments);
        } else {
            this._drawLines(ctx);
            return this;
        }
    }

    onConfig(/*conf*/) {
        if (this._getRenderer()) {
            this._getRenderer().render();
        }
    }

    onRemove() {
        delete this._dataToDraw;
    }

    /**
     * Export the ODLine's JSON.
     * @return {Object} layer's JSON
     */
    toJSON(options) {
        if (!options) {
            options = {};
        }
        const json = {
            'type'      : this.getJSONType(),
            'id'        : this.getId(),
            'options'   : this.config()
        };
        const data = this.getData();
        if (options['clipExtent']) {
            const clipExtent = new maptalks.Extent(options['clipExtent']);
            const clipped = [];
            for (let i = 0, len = data.length; i < len; i++) {
                if (clipExtent.contains(new maptalks.Coordinate(data[i][0], data[i][1]))) {
                    clipped.push(data[i]);
                }
            }
            json['data'] = clipped;
        } else {
            json['data'] = data;
        }

        return json;
    }

    /**
     * Reproduce a ODLineLayer from layer's JSON.
     * @param  {Object} json - layer's JSON
     * @return {maptalks.ODLineLayer}
     * @static
     * @private
     * @function
     */
    static fromJSON(json) {
        if (!json || json['type'] !== this.getJSONType()) { return null; }
        return new ODLineLayer(json['id'], json['data'], json['options']);
    }

    _precise(n) {
        return maptalks.Util.round(n * 100) / 100;
    }

    _drawLines(ctx) {
        if (!this._dataToDraw) {
            return;
        }
        const map = this.getMap();
        const scale = map.getScale();
        const empty = {};
        const symbol = this.options['symbol'] || defaultSymbol;
        let points, style;
        let p0, p1, p2;
        ctx.lineCap = 'round';
        for (let i = 0, l = this._dataToDraw.length; i < l; i++) {
            points = this._dataToDraw[i].points;
            style = this._data[i]['symbol'] || empty;
            ctx.strokeStyle = style['lineColor'] || symbol['lineColor'] || 'rgba(255, 255, 255, 0.01)';//'rgba(135, 196, 240, 0.1)';
            ctx.lineWidth = style['lineWidth'] || symbol['lineWidth'] ||  1;
            ctx.beginPath();
            p0 = map._pointToContainerPoint(points[0].multi(1 / scale));
            ctx.moveTo(p0.x, p0.y);
            p1 = map._pointToContainerPoint(points[1].multi(1 / scale));
            if (points[2]) {
                p2 = map._pointToContainerPoint(points[2].multi(1 / scale));
                // quadradic curve
                ctx.quadraticCurveTo(p2.x, p2.y, p1.x, p1.y);
            } else {
                ctx.lineTo(p1.x, p1.y);
            }
            ctx.stroke();
        }

    }

    _prepareData() {
        if (!this._data) {
            return;
        }
        const curveness = this.options['curveness'];
        const map = this.getMap(),
            maxZ = map.getMaxNativeZoom();
        const dataToDraw = [];
        let p1, p2;
        for (let i = 0, l = this._data.length; i < l; i++) {
            p1 = map.coordinateToPoint(new maptalks.Coordinate(this._data[i].coordinates[0]), maxZ);
            p2 = map.coordinateToPoint(new maptalks.Coordinate(this._data[i].coordinates[1]), maxZ);
            const points = [p1, p2];
            if (curveness) {
                const distance = p2.distanceTo(p1);
                const normal = p1.substract(p2)._unit()._perp();
                const middle = p1.add(p2)._multi(1 / 2);
                const curveLen = curveness * distance;
                const ctrlPoint = new maptalks.Point(middle.x + curveLen * normal.x, middle.y + curveLen * normal.y);
                points.push(ctrlPoint);
            }
            dataToDraw.push({
                'points' : points,
                'time'   : Math.random() * this.options['animationDuration']
            });
        }
        this._dataToDraw = dataToDraw;
    }
}

ODLineLayer.mergeOptions(options);

ODLineLayer.registerJSONType('ODLineLayer');
