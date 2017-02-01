/*!
 * maptalks.odline v0.1.0
 * LICENSE : MIT
 * (c) 2016-2017 maptalks.org
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('maptalks')) :
	typeof define === 'function' && define.amd ? define(['exports', 'maptalks'], factory) :
	(factory((global.maptalks = global.maptalks || {}),global.maptalks));
}(this, (function (exports,maptalks) { 'use strict';

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

function quadraticAt(p0, p1, p2, t) {
    var onet = 1 - t;
    return onet * (onet * p0 + 2 * t * p1) + t * t * p2;
}

var options = {
    'animation': true,
    'random': false,
    'duration': 6000,
    'curveness': 0.2,
    'trail': 20,
    'globalCompositeOperation': 'lighter'
};

var ODLineLayer = function (_maptalks$ParticleLay) {
    _inherits(ODLineLayer, _maptalks$ParticleLay);

    function ODLineLayer(id, data, options) {
        _classCallCheck(this, ODLineLayer);

        if (data && !Array.isArray(data)) {
            data = [data];
        }

        var _this = _possibleConstructorReturn(this, _maptalks$ParticleLay.call(this, id, options));

        _this.setData(data);
        return _this;
    }

    ODLineLayer.prototype.getData = function getData() {
        return this._data;
    };

    ODLineLayer.prototype.setData = function setData(data) {
        this._data = data;
        if (this.getMap()) {
            this._prepareData();
            if (this._getRenderer()) {
                this._getRenderer().render();
            }
        }
        return this;
    };

    ODLineLayer.prototype.identify = function identify() {};

    ODLineLayer.prototype.getParticles = function getParticles(t) {
        if (!this._animStartTime) {
            this._animStartTime = Date.now();
        }
        var map = this.getMap();
        var scale = map.getScale();
        var r = (t - this._animStartTime) % this.options['duration'] / this.options['duration'];
        var particles = [],
            empty = {};
        var points, x, y, style;
        var p0, p1, cp;
        for (var i = 0, l = this._dataToDraw.length; i < l; i++) {
            if (this.options['random']) {
                r = (t - this._animStartTime - this._dataToDraw[i]['time']) % this.options['duration'] / this.options['duration'];
                if (r < 0) {
                    r = 0;
                }
            }
            if (r > 0) {
                points = this._dataToDraw[i]['points'];
                style = this._data[i]['symbol'] || empty;
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
                    'point': map._pointToContainerPoint(new maptalks.Point(x, y)._multi(1 / scale)),
                    'r': (style['lineWidth'] || 3) / 2,
                    'color': style['lineColor']
                });
            }
        }
        return particles;
    };

    ODLineLayer.prototype.draw = function draw(ctx) {
        if (!this._dataToDraw) {
            this._prepareData();
        }
        if (this.options['animation']) {
            return _maptalks$ParticleLay.prototype.draw.apply(this, arguments);
        } else {
            this._drawLines(ctx);
            return this;
        }
    };

    ODLineLayer.prototype.onConfig = function onConfig() /*conf*/{
        if (this._getRenderer()) {
            this._getRenderer().render();
        }
    };

    ODLineLayer.prototype.onRemove = function onRemove() {
        delete this._dataToDraw;
    };

    /**
     * Export the ODLine's JSON.
     * @return {Object} layer's JSON
     */


    ODLineLayer.prototype.toJSON = function toJSON(options) {
        if (!options) {
            options = {};
        }
        var json = {
            'type': this.getJSONType(),
            'id': this.getId(),
            'options': this.config()
        };
        var data = this.getData();
        if (options['clipExtent']) {
            var clipExtent = new maptalks.Extent(options['clipExtent']);
            var clipped = [];
            for (var i = 0, len = data.length; i < len; i++) {
                if (clipExtent.contains(new maptalks.Coordinate(data[i][0], data[i][1]))) {
                    clipped.push(data[i]);
                }
            }
            json['data'] = clipped;
        } else {
            json['data'] = data;
        }

        return json;
    };

    /**
     * Reproduce a ODLineLayer from layer's JSON.
     * @param  {Object} json - layer's JSON
     * @return {maptalks.ODLineLayer}
     * @static
     * @private
     * @function
     */


    ODLineLayer.fromJSON = function fromJSON(json) {
        if (!json || json['type'] !== this.getJSONType()) {
            return null;
        }
        return new ODLineLayer(json['id'], json['data'], json['options']);
    };

    ODLineLayer.prototype._precise = function _precise(n) {
        return maptalks.Util.round(n * 100) / 100;
    };

    ODLineLayer.prototype._drawLines = function _drawLines(ctx) {
        if (!this._dataToDraw) {
            return;
        }
        var map = this.getMap();
        var scale = map.getScale();
        var empty = {};
        var defaultSymbol = this.options['symbol'] || empty;
        var points, style;
        var p0, p1, p2;
        ctx.lineCap = 'round';
        for (var i = 0, l = this._dataToDraw.length; i < l; i++) {
            points = this._dataToDraw[i].points;
            style = this._data[i]['symbol'] || empty;
            ctx.strokeStyle = style['lineColor'] || defaultSymbol['lineColor'] || 'rgba(255, 255, 255, 0.01)'; //'rgba(135, 196, 240, 0.1)';
            ctx.lineWidth = style['lineWidth'] || defaultSymbol['lineWidth'] || 1;
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
    };

    ODLineLayer.prototype._prepareData = function _prepareData() {
        if (!this._data) {
            return;
        }
        var curveness = this.options['curveness'];
        var map = this.getMap(),
            maxZ = map.getMaxZoom();
        var dataToDraw = [];
        var p1, p2;
        for (var i = 0, l = this._data.length; i < l; i++) {
            p1 = map.coordinateToPoint(new maptalks.Coordinate(this._data[i].coordinates[0]), maxZ);
            p2 = map.coordinateToPoint(new maptalks.Coordinate(this._data[i].coordinates[1]), maxZ);
            var points = [p1, p2];
            if (curveness) {
                var distance = p2.distanceTo(p1);
                var normal = p1.substract(p2)._unit()._perp();
                var middle = p1.add(p2)._multi(1 / 2);
                var curveLen = curveness * distance;
                var ctrlPoint = new maptalks.Point(middle.x + curveLen * normal.x, middle.y + curveLen * normal.y);
                points.push(ctrlPoint);
            }
            dataToDraw.push({
                'points': points,
                'time': Math.random() * this.options['duration']
            });
        }
        this._dataToDraw = dataToDraw;
    };

    return ODLineLayer;
}(maptalks.ParticleLayer);

ODLineLayer.mergeOptions(options);

ODLineLayer.registerJSONType('ODLineLayer');

exports.ODLineLayer = ODLineLayer;

Object.defineProperty(exports, '__esModule', { value: true });

})));
