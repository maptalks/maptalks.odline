# maptalks.odline

[![CircleCI](https://circleci.com/gh/maptalks/maptalks.odline/tree/master.svg?style=shield)](https://circleci.com/gh/maptalks/maptalks.odline)
[![NPM Version](https://img.shields.io/npm/v/maptalks.odline.svg)](https://github.com/maptalks/maptalks.odline)

A maptalks Layer to draw OD(Origin-Destination) lines.

![screenshot](https://cloud.githubusercontent.com/assets/13678919/25623191/1d7f9b44-2f89-11e7-9c33-b4346478a685.jpg)

## Examples

* [Animated lines of migration in China](https://maptalks.github.io/maptalks.odline/demo/mig.html). (inspired by [echarts](http://echarts.baidu.com/echarts2/doc/example/map22.html))
* [Curves of migration](https://maptalks.github.io/maptalks.odline/demo/curves.html).

## Install
  
* Install with npm: ```npm install maptalks.odline```. 
* Download from [dist directory](https://github.com/maptalks/maptalks.odline/tree/gh-pages/dist).
* Use unpkg CDN: ```https://unpkg.com/maptalks.odline/dist/maptalks.odline.min.js```

## Usage

As a plugin, ```maptalks.odline``` must be loaded after ```maptalks.js``` in browsers.
```html
<link rel="stylesheet" href="https://unpkg.com/maptalks/dist/maptalks.css">
<script type="text/javascript" src="https://unpkg.com/maptalks/dist/maptalks.min.js"></script>
<script type="text/javascript" src="https://unpkg.com/maptalks.odline/dist/maptalks.odline.min.js"></script>
<script>
var odlayer = new maptalks.ODLineLayer('od', data)
    .addTo(map);
</script>
```
## Supported Browsers

IE 9-11, Chrome, Firefox, other modern and mobile browsers.

## API Reference

```ODLineLayer``` is a subclass of [maptalks.ParticleLayer](https://maptalks.github.io/docs/api/ParticleLayer.html) and inherits all the methods of its parent.

### `Constructor`

```javascript
// data's format
// [{ coordinates : [[x, y], [x, y]], symbol : {..} }, { coordinates : [[x, y], [x, y]], symbol : {..} } ..]
new maptalks.ODLineLayer(id, data, options)
```

* id **String** layer id
* data **Object[]** origin-destination data, `[{ coordinates : [[x, y], [x, y]], symbol : {..} }, { coordinates : [[x, y], [x, y]], symbol : {..} } ..]`
* options **Object** options
    * animation **Boolean** is animation? true or false (true by default)
    * random **Boolean** whether the animation starts randomly, true or false (false by default)
    * animationDuration **Number** duration of a animation cycle in ms (6000 by default)
    * animationOnce **Boolean** does animation only run once? (false by default)
    * curveness **Number** curveness of the od-line, from 0(straight) to 1  (0.2 by default)
    * trail **Number** trail length of the particle when animating (20 by default)
    * globalCompositeOperation **String** [globalCompositeOperation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation) of the canvas when drawing particles
    * Other options defined in [maptalks.ParticleLayer](https://maptalks.github.io/docs/api/ParticleLayer.html)

### `getData()`

get layer's data

**Returns** `Object[]`

### `setData(data)`

set new data to the layer

* data **Object[]** origin-destination data

**Returns** `this`

### `toJSON()`

export the ODLineLayer's JSON.

```javascript
var json = odlayer.toJSON();
```

**Returns** `Object`

## Contributing

We welcome any kind of contributions including issue reportings, pull requests, documentation corrections, feature requests and any other helps.

## Develop

The only source file is ```index.js```.

It is written in ES6, transpiled by [babel](https://babeljs.io/) and tested with [mocha](https://mochajs.org) and [expect.js](https://github.com/Automattic/expect.js).

### Scripts

* Install dependencies
```shell
$ npm install
```

* Watch source changes and generate runnable bundle repeatedly
```shell
$ gulp watch
```

* Tests
```shell
$ npm test
```

* Watch source changes and run tests repeatedly
```shell
$ gulp tdd
```

* Package and generate minified bundles to dist directory
```shell
$ gulp minify
```

* Lint
```shell
$ npm run lint
```
