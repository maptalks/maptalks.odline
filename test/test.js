describe('D3Layer', function () {
    var container, map;
    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '400px';
        container.style.height = '300px';
        document.body.appendChild(container);
        map = new maptalks.Map(container, {
            center : [0, 0],
            zoom : 17
        });
    });

    afterEach(function () {
        map.remove();
        maptalks.DomUtil.removeDomNode(container);
    });

    it('should be able to get particles when added with animation', function (done) {
        var data = [{ coordinates : [map.getCenter().add(-0.1, 0).toArray(), map.getCenter().add(0.1, 0).toArray()] }];
        var layer = new maptalks.ODLineLayer('g', data, { animation : true }).addTo(map);
        setTimeout(function () {
            var particles = layer.getParticles(Date.now() + 1000);
            expect(particles.length).to.be.above(0);
            done();
        }, 200);
    });

    it('should display when added with one line with default options', function (done) {
        var data = [{ coordinates : [map.getCenter().add(-0.1, 0).toArray(), map.getCenter().add(0.1, 0).toArray()] }];
        var layer = new maptalks.ODLineLayer('g', data);
        layer.on('layerload', function () {
            expect(layer).to.be.painted(0, 0);
            done();
        })
         .addTo(map);
    });

    it('should display when added with one curve line', function (done) {
        var data = [{ coordinates : [map.getCenter().add(-0.0001, 0).toArray(), map.getCenter().add(0.0001, 0).toArray()] }];
        var layer = new maptalks.ODLineLayer('g', data, { animation : false, curveness : 0.2 });
        layer.on('layerload', function () {
            expect(layer).not.to.be.painted(0, 0);
            expect(layer).to.be.painted(0, -1);
            done();
        })
         .addTo(map);
    });


    it('should display if added again after removed', function (done) {
        var data = [{ coordinates : [map.getCenter().add(-0.0001, 0).toArray(), map.getCenter().add(0.0001, 0).toArray()] }];
        var layer = new maptalks.ODLineLayer('g', data, { animation : false, curveness : 0 });
        layer.once('layerload', function () {
            expect(layer).to.be.painted();
            map.removeLayer(layer);
            layer.once('layerload', function () {
                expect(layer).to.be.painted();
                done();
            });
            map.addLayer(layer);
        });
        map.addLayer(layer);
    });

    it('should show', function (done) {
        var data = [{ coordinates : [map.getCenter().add(-0.0001, 0).toArray(), map.getCenter().add(0.0001, 0).toArray()] }];
        var layer = new maptalks.ODLineLayer('g', data, { animation : false, curveness : 0, visible : false });
        layer.once('add', function () {
            expect(layer).not.to.be.painted();
            layer.once('layerload', function () {
                expect(layer).to.be.painted();
                done();
            });
            layer.show();
        });
        map.addLayer(layer);
    });

    it('should hide', function (done) {
        var data = [{ coordinates : [map.getCenter().add(-0.0001, 0).toArray(), map.getCenter().add(0.0001, 0).toArray()] }];
        var layer = new maptalks.ODLineLayer('g', data, { animation : false, curveness : 0 });
        layer.once('layerload', function () {
            expect(layer).to.be.painted();
            layer.once('hide', function () {
                expect(layer).not.to.be.painted();
                done();
            });
            layer.hide();
        });
        map.addLayer(layer);
    });

    it('should be able to set data', function (done) {
        var data2 = [{ coordinates : [map.getCenter().add(-0.0001, 0.0001).toArray(), map.getCenter().add(0.0001, 0.0001).toArray()] }];
        var data = [{ coordinates : [map.getCenter().add(-0.0001, 0).toArray(), map.getCenter().add(0.0001, 0).toArray()] }];
        var layer = new maptalks.ODLineLayer('g', data, { animation : false, curveness : 0 });
        layer.once('layerload', function () {
            expect(layer).to.be.painted();
            layer.once('layerload', function () {
                expect(layer).not.to.be.painted();
                expect(layer).to.be.painted(0, -10);
                done();
            });
            layer.setData(data2);
        });
        map.addLayer(layer);
    });

});
