$(function() {
    document.addEventListener('contextmenu', event => event.preventDefault());
    
                L.Polyline.prototype.length_in_meters = function () {
                    var metros_totales_ruta = 0;
                    var coordenadas_iniciales = null;
                    var array_coordenadas_polilinea = this._latlngs;

                    for (i = 0; i < array_coordenadas_polilinea.length - 1; i++) {
                        coordenadas_iniciales = array_coordenadas_polilinea[i];
                        metros_totales_ruta  += coordenadas_iniciales.distanceTo(array_coordenadas_polilinea[i + 1]);
                    }
                    //redondear los metros de la ruta...
                    metros_totales_ruta = metros_totales_ruta.toFixed();
                    return metros_totales_ruta;
                }

                /*
                 *  Based on:
                 *  https://iosphere.github.io/Leaflet.hotline/demo/
                 *  http://leafletjs.com/examples/choropleth/
                 */

                /**
                 * CREATE NEW SYMBOL TO POLYLINE DECORATOR
                 */
                L.Symbol.LongArrowHead = L.Class.extend({
                    isZoomDependant: true,
        
                    options: {
                        polygon: true,
                        pixelSize: 10,
                        headAngle: 70,
                        pathOptions: {
                            stroke: false,
                            weight: 2
                        }
                    },
        
                    initialize: function (options) {
                        L.Util.setOptions(this, options);
                        this.options.pathOptions.clickable = false;
                    },

                    buildSymbol: function(dirPoint, latLngs, map, index, total) {
                        var opts = this.options;
                        var path;
                        if(opts.polygon) {
                            path = new L.Polygon(this._buildArrowPath(dirPoint, map), opts.pathOptions);
                        } else {
                            path = new L.Polyline(this._buildArrowPath(dirPoint, map), opts.pathOptions);
                        }
                        return path;
                    },
        
                    _buildArrowPath: function (dirPoint, map) {
                        var d2r = Math.PI / 180;
                        var tipPoint = map.project(dirPoint.latLng);
                        var direction = (-(dirPoint.heading - 90)) * d2r;
                        var radianArrowAngle = this.options.headAngle / 2 * d2r;
            
                        var headAngle1 = direction + radianArrowAngle,
                            headAngle2 = direction - radianArrowAngle;
                            headAngle3 = direction + 0;
                            headAngle4 = direction - 0;
                            headAngle5 = direction - radianArrowAngle;
                        var arrowHead1 = new L.Point(
                                tipPoint.x - this.options.pixelSize * Math.cos(headAngle1),
                                tipPoint.y + this.options.pixelSize * Math.sin(headAngle1)),
                            arrowHead2 = new L.Point(
                                tipPoint.x - this.options.pixelSize * Math.cos(headAngle2),
                                tipPoint.y + this.options.pixelSize * Math.sin(headAngle2));
                            arrowBack1 = new L.Point(
                                arrowHead1.x - (this.options.pixelSize*1.5) * Math.cos(headAngle3),
                                arrowHead1.y + (this.options.pixelSize*1.5) * Math.sin(headAngle3)),
                            arrowBack2 = new L.Point(
                                arrowHead2.x - (this.options.pixelSize * 1.5) * Math.cos(headAngle4),
                                arrowHead2.y + (this.options.pixelSize * 1.5) * Math.sin(headAngle4));
                            arrowBackCenter = new L.Point(
                                arrowBack2.x + this.options.pixelSize * Math.cos(headAngle5),
                                arrowBack2.y - this.options.pixelSize * Math.sin(headAngle5));
                         
                        return [
                            map.unproject(arrowBack1),
                            map.unproject(arrowHead1),
                            dirPoint.latLng, 
                            map.unproject(arrowHead2),
                            map.unproject(arrowBack2),
                            map.unproject(arrowBackCenter),
                        ];
                    }
                });

                L.Symbol.longArrowHead = function (options) {
                    return new L.Symbol.LongArrowHead(options);
                };

                L.Symbol.Circle = L.Class.extend({
                    isZoomDependant: true,
     
                    options: {
                        radius: 6,
                        pathOptions: {
                            stroke: false,
                            weight: 2
                        }
                    },
     
                    initialize: function (options) {
                        L.Util.setOptions(this, options);
                        this.options.pathOptions.clickable = false;
                    },

                    buildSymbol: function(dirPoint, latLngs, map, index, total) {
                        var opts = this.options;
                        var circle = new L.CircleMarker(dirPoint.latLng, opts.pathOptions);
                        circle.setRadius(opts.radius);
                        return circle;
                    },
                });

                L.Symbol.circle = function (options) {
                    return new L.Symbol.Circle(options);
                };

                /**
                 * SET MAP
                 */
                var beauchefLocation = L.latLng(-33.457910, -70.663869);
                map = L.map("transantiago", {
                    editable: true,
                    closePopupOnClick: false
                }).setView(beauchefLocation, 12.49, {
                  "animate": true,
                  "pan": {
                    "duration": 10
                  }
                });
                var layers = {};
                setStyle('dark');

                var mapControl = L.control.layers({}, {}).addTo(map);

                // color for route
                /*
                var getColor = function (d) {
                    return d <  0  ? '#c4c4c4' :
                           d <= 15 ? '#ff0000' :
                           d <= 19 ? '#ff9000' :
                           d <= 21 ? '#fff600' :
                           d <= 25 ? '#19ff00' :
                           d <= 30 ? '#0d8900' :
                                     '#2133f2';
                }
            
                var getColorName = function (d) {
                     return d <  0  ? 'grey' :
                            d <= 15 ? 'red' :
                            d <= 19 ? 'orange' :
                            d <= 21 ? 'yellow' :
                            d <= 25 ? 'green' :
                            d <= 30 ? 'darkGreen' :
                                      'blue';
                }
                */

                var getColor = function (d) {
                    return d <  0  ? '#7ec442' :
                           d <= 15 ? '#7ec442' :
                           d <= 19 ? '#7ec442' :
                           d <= 21 ? '#7ec442' :
                           d <= 25 ? '#7ec442' :
                           d <= 30 ? '#7ec442' :
                                     '#7ec442';
                }
                
                var getColorName = function (d) {
                     return d <  0  ? 'orange' :
                            d <= 15 ? 'orange' :
                            d <= 19 ? 'orange' :
                            d <= 21 ? 'orange' :
                            d <= 25 ? 'orange' :
                            d <= 30 ? 'orange' :
                                      'orange';
                }

    	    var setLineText = function(line, overlay, streetTime, streetVelocity) {

            		if (line == null) {
                                line.setText(null);
            		    return;
            		}

                    var orientationLine = getDegrees(line._latlngs[0].lat, line._latlngs[0].lng, line._latlngs[line._latlngs.length-1].lat, line._latlngs[line._latlngs.length-1].lng);
                    var optionsForText = {
                                center: true,
                                below: false,
                                orientation: orientationLine<0?'flip':'0',
                                offset: 30,
                                attributes: {
                                    "class": "axislabel"
                                }
                        };

            		var text = isNaN(streetTime)?"Sin datos":streetTime+" min.";
            		if (streetTime <= 0) {
                                text = "Falta info."
            		}

                    /*
                    var marker = new L.marker([line._latlngs[Math.round((line._latlngs.length-1)/2)].lat, line._latlngs[Math.round((line._latlngs.length-1)/2)].lng], { opacity: 0.01 }); //opacity may be set to zero
                    marker.bindTooltip(text, {permanent: true, className: "tooltip-axis", offset: [0,0], direction: 'left', opacity: 1 });
                    overlay.addLayer(marker);
                    */
                    
                    //line.setText(text,optionsForText);
                }

                function getDegrees(lat1, long1, lat2, long2) {
                    // angle in degrees
                    var angleDeg = Math.atan2(long2 - long1, lat2 - lat1) * 180 / Math.PI;
                    return angleDeg;
                }


                /**
                 * DEFINE INFO
                 */
                var info = L.control({position: 'topright'});

                info.onAdd = function (map) {
                    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
                    this._div.innerHTML = '<h4>Tiempo por eje</h4>' + 
                         '<b>Muestra los tiempos de viaje</b>' + 
                         '<br /> Los datos consideran la velocidad ' + 
                         '<br /> de los buses de los últimos 15 minutos ' +
                         '<br /> que recorren las calles señaladas.' + 
                         '<br /><h4>Seleccionar tipo de representación</h4>' + 
                         '<br /><select id="drawType" class="form-control">' + 
                             '<option value="1">Línea</option>' + 
                             '<option value="2" selected=selected>Patrón</option>' + 
                             '<option value="3">Calor</option>' + 
                         '</select>' +
                         '<br /><h4>Indicar destino</h4>' + 
                         '<select id="destination" class="form-control">' + 
                         '</select>';
                    return this._div;
                };
                info.addTo(map);
                 
                /**
                 * DEFINE LEGEND
                 */
                var legend = L.control({position: 'bottomright'});
                legend.onAdd = function (map) {

                    var div = L.DomUtil.create('div', 'info legend'),
                    grades = [0, 15, 19, 21, 25, 30],
                    labels = [];

                    // loop through our density intervals and generate a label with a colored square for each interval
                    for (var i = 0; i < grades.length; i++) {
                        div.innerHTML +=
                        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                    }

                    return div;
                }; 
                legend.addTo(map);

                /**
                 * DEFINE DRAW FUNCTIONS 
                 */
                function drawHotline(name, street) {
                     
                    var latLngsWithVelocities = [];
                    var joinedSections = [];
                    var streetName = name;
                    var streetTime = (street.time/60).toFixed();
                    var streetVelocity = street.velocity;

                    $.each(street.sections, function(i, section){
                        var velocity = section.velocity;
                        var time = section.time;
                        var originStreet = section.originStreet;
                        var destinationStreet = section.destinationStreet;
                            
                        section.points.map(function(point){
                            point["velocity"] = velocity;
                            point["time"] = time;
                        });
                        joinedSections = joinedSections.concat(section.points);
                    });

                    // order by distOnRoute
                    joinedSections.sort(function(a, b) {
                        return a.distOnRoute - b.distOnRoute;
                    });
                         
                    $.each(joinedSections, function(i2, point){
                        latLngsWithVelocities.push([
                            point.latitude, 
                            point.longitude, 
                            streetVelocity]);
                    });

                    var line = L.hotline(latLngsWithVelocities, {
                        min: -1, 
                        max: 100, 
                        palette: {
                            0.0:  getColor(0),
                            0.15: getColor(15),
                            0.19: getColor(19),
                            0.21: getColor(21),
                            0.25: getColor(25),
                            0.30: getColor(30),
                            1.0: getColor(100),
                        },
                        weight: 10,
                        outlineColor: '#000000',
                        outlineWidth: 1, 
                        //smoothFactor: 2
                    });
                    // var line = L.polyline(latLngsWithVelocities);
                    //var message = '<h1>' + streetTime + ' min.</h1><h4>Aquí puede ir otra cosa.</h4>';
                    //line.bindPopup(message);
    		//console.log('AA');console.log(line._latlngs);console.log('BB');
    		//var pl = L.polyline(line._latlngs, {opacity: 0});
    		//setLineText(pl, streetTime, streetVelocity)
    		//pl.addTo(map);

                    //console.log("Map updated with hotlines");

                    return line;
                };

                function drawPolylineDecorator(name, street) {
                      
                    var overlay = L.layerGroup([]);
                    var streetName = getStreetName(name);
                    var streetTime = (street.time/60).toFixed();
                    var streetVelocity = street.velocity;
                    var origin = street.origin;
                    var destination = street.destination;

                    var joinedSections = [];
                    var latLngs = [];

                    $.each(street.sections, function(i, section){
                        joinedSections = joinedSections.concat(section.points);
                    });    
                     
                    // order by distOnRoute
                    joinedSections.sort(function(a, b) {
                        return a.distOnRoute - b.distOnRoute;
                    });
     
                    $.each(joinedSections, function(i2, point){
                        latLngs.push([point.latitude, point.longitude]);
                    });

                    var line = L.polyline(latLngs, {color: getColor(streetVelocity), weight: 10});
                    overlay.addLayer(line);
                    var line2 = L.polyline(latLngs, {color: '#ffffff', weight: 2, dashArray: "2 10"});
                    overlay.addLayer(line2);

                    var patternsOpts = [
                        // defines a pattern of 10px-wide dashes, repeated every 20px on the line
                        {
                            offset: 10, 
                            endOffset: 0, 
                            repeat: '5%', symbol: 
                            /*L.Symbol.longArrowHead({
                            /*L.Symbol.arrowHead({
                                rotate: true,
                                pixelSize: 12, 
                                polygon: true, 
                                pathOptions: {
                                    color: getColor(streetVelocity),
                                    stroke: false,
                                    fillColor: getColor(streetVelocity),
                                    fillOpacity: 1.0
                                }
                            })}
                        */
                        L.Symbol.circle({
                            radius: 5, 
                            pathOptions: {
                                color: getColor(streetVelocity),
                                stroke: false,
                                fillColor: "#FFFFFF",
                                fillOpacity: 1.0
                            }
                        })
                    }]

                    var decorator = L.polylineDecorator(line, {
                        patterns: patternsOpts                          
                    });
                      var text = isNaN(streetTime)?"Sin datos":streetTime+"'";
    		          var textmin = isNaN(streetTime)?"Sin datos":streetTime+" min.";

                    var message = "<div class='popup-wrapper'><div class='popup-content'><div class='left'><i class='icono-bus'></i><h1>" + textmin + "</h1></div><div class='right'><h4><i class='icono-geolocalizador'></i>" + streetName + "</h4><h5><strong>Origen:</strong> " + origin + "</h5><h5><strong>Destino:</strong> " + destination + "</h5></div></div><div class='popup-tip'></div></div><div class='flecha-before'></div><div class='flecha-after'></div>";
                    decorator.bindPopup(message,{closeButton: false});

                    line.on('click', function(e) {
                        console.log("mouseover line");
                        line.openPopup();
                        $(".leaflet-popup").unbind("click");
                        $(".leaflet-popup").click(function() {
                            map.closePopup();
                        });
                    });

                    line.bindPopup(message, {
                        className: getColorName(streetVelocity),
                        closeButton: false
                    });

                    line2.on('click', function(e) {
                        console.log("mouseover line2");
                        line.openPopup();
                        $(".leaflet-popup").unbind("click");
                        $(".leaflet-popup").click(function() {
                            map.closePopup();
                        });
                    });

                    overlay.addLayer(decorator);

                    //********************************************************/
                    //* animation
                    var arrowOffset = 0;
                    patternsOpts[0].repeat = 0;
                    var delta = (1/streetTime)*5
                    var anim = window.setInterval(function() {
                        patternsOpts[0].offset = arrowOffset + '%';
                        decorator.setPatterns(patternsOpts);
                        if(arrowOffset > 100)
                            arrowOffset = 0;
                            arrowOffset = arrowOffset + delta;
                    }, 10);
                    //*/
                    //********************************************************/
                         
                    //console.log("Map updated with polyline decorator");
                    setLineText(line2, overlay, streetTime, streetVelocity)
                    var markerbus = new L.marker(latLngs[Math.round((latLngs.length-1)/2)], { opacity: 0.01 }); //opacity may be set to zero
                    markerbus.bindTooltip(text, {permanent: true, className: "tooltip-axis", offset: [0,0], direction: 'left', opacity: 1 });

                    markerbus.on('click', function(e) {
                        console.log("mouseover markerbus");
                        line.openPopup();
                        $(".leaflet-popup").unbind("click");
                        $(".leaflet-popup").click(function() {
                            map.closePopup();
                        });
                    });
                    overlay.addLayer(markerbus);
                    return overlay;
                };

                function drawColorLine(name, street) {
                 
                    var overlay = L.layerGroup([]);
                    var streetName = name;
                    var streetTime = (street.time/60).toFixed();
                    var streetVelocity = street.velocity;
                    var origin = street.origin;
                    var destination = street.destination;

                    var joinedSections = [];
                    var latLngs = [];
                    //var streetVelocity = ;
                    $.each(street.sections, function(i, section){
                        /*
                        var velocity = section.velocity;
                        var sectionTime = section.time;
                        */
                        joinedSections = joinedSections.concat(section.points);
                    });
                     
                    // order by distOnRoute
                    joinedSections.sort(function(a, b) {
                        return a.distOnRoute - b.distOnRoute;
                    });

                    $.each(joinedSections, function(i2, point){
                        latLngs.push([point.latitude, point.longitude]);
                    });

                    var line = L.polyline(latLngs, {
                        color: getColor(streetVelocity), 
                        weight: 8
                    });

                    //var message = "<h1>" + streetTime + " min.</h1><h4>Calle: " + name + "</h4><h5>Origen: " + origin + "</h5><h5>Destino: " + destination + "</h5>";
                    /*line.bindPopup(message, {
                        closeButton: false
                    });
                    */

    		        setLineText(line, streetTime, streetVelocity)

                    overlay.addLayer(line);
                     
                    //console.log("Map updated with polyline");

                    return overlay;
                };

                /**
                 * LOAD DATA
                 */
                var updateMap = function(street,status){
                    if(status=='off') {
                    	console.log("off");
                    	// remove currents layers from map
                    	$.each(layers, function(i, l){
                    		if(l.name.toUpperCase().indexOf(street.toUpperCase())!=-1) {
                				console.log(l);
                			    map.removeLayer(l.layer);
                			    mapControl.removeLayer(l.layer);
                    		}
                    	});
                    } else if(status=='on') {
                    	// add layers to map and control
                    	$.each(layers, function(i, l){
                    		if(l.name.toUpperCase().indexOf(street.toUpperCase())!=-1) {
	                    	    l.layer.addTo(map);
	                    	    mapControl.addOverlay(l.layer, l.name);
	                    	}
                    	});
                    }
                };

                // it is responsable of select the way to draw
                var drawLines = function(name, street){
                    //var drawType = $("#drawType option:selected").val();
                    var drawType = "2";

                    switch(drawType) {
                        case "1": 
                            layer = drawColorLine(name, street);
                            break;
                        case "2": 
                            layer = drawPolylineDecorator(name, street);
                            break;
                        case "3": 
                            layer = drawHotline(name, street);
                            break;
                    }

                    return layer;
                };

                var streetsData = {};
                var getStreetData = function() {
                	/*
                	var layers = [];
                	// each zone
                    $.each(streetsData['Todos'], function(zone, streets) {
                        // draw street
                        $.each(streets, function(name, street) {
                        		var layer = drawLines(name, street);
                        		layers.push({
                        		    name: name,
                        		    layer: layer
                        		});
                        });
                    });
                    return layers;
                    */
                    return streetsData['Todos'];
                }

                var poisData = {};
                var getPoisData = function() {
                    var destination = $("#destination option:selected").val();
                    var origins = poisData[destination];
                    var pois = [];

                    $.each(origins, function (i, origin){
                        $.each(origin, function (name, points){
                            pois = pois.concat(points);
                        });
                    });
                         
                    return pois;
                }

    	    function fillMap() {
                    try {
                        $.ajax({
                            url: "/getStreetData",
                            success: function(data){
                                var all = {};
                                $.each(data.Destination, function(i,origin){
                                    $.each(origin, function(i,v){
                                        all = $.extend(all, v);
                                   });
                                });
                                streetsData = data.Destination;
                                streetsData = $.extend(data.Destination,{'Todos': {'Todos': all}});

                                console.log(streetsData);

                                layers = [];

                            	// each zone
                                $.each(streetsData['Todos'], function(zone, streets) {
                                    // draw street
                                    $.each(streets, function(name, street) {
                                    		var layer = drawLines(name, street);
                                    		layers.push({
                                    		    name: name,
                                    		    layer: layer
                                    		});
                                    });
                                });
                            }
                        });
                    } catch(e) {
                        console.log(e);
                    }
                }

            function setStyle(style) {
                var grayStyle;
                switch(style) {
                    case 'dark':
                        //grayStyle = 'https://api.mapbox.com/styles/v1/ivanefrain/cj8oi0vkz8opx2rlq5mz1oj22/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaXZhbmVmcmFpbiIsImEiOiJjajhvaHp6aHkwMzlqMndvM3g5NGdpNXBoIn0.KuTuD0JAnV0TiVW2Qlmoqw';
                        grayStyle = 'https://api.mapbox.com/styles/v1/ivanefrain/cjdamvbv4azji2rqoocim4ulz/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaXZhbmVmcmFpbiIsImEiOiJjajhvaHp6aHkwMzlqMndvM3g5NGdpNXBoIn0.KuTuD0JAnV0TiVW2Qlmoqw';
                        break;
                    case 'light':
                        //grayStyle = 'https://api.mapbox.com/styles/v1/ivanefrain/cj8py6pjaa1vo2sr8jeu03yga/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaXZhbmVmcmFpbiIsImEiOiJjajhvaHp6aHkwMzlqMndvM3g5NGdpNXBoIn0.KuTuD0JAnV0TiVW2Qlmoqw';
                        grayStyle = 'https://api.mapbox.com/styles/v1/ivanefrain/cja9nm6oc1o8n2rq741ywocs8/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaXZhbmVmcmFpbiIsImEiOiJjajhvaHp6aHkwMzlqMndvM3g5NGdpNXBoIn0.KuTuD0JAnV0TiVW2Qlmoqw';
                        break;
                    default:
                        grayStyle = 'https://api.mapbox.com/styles/v1/mapbox/'+style+'-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHJhbnNhcHAiLCJhIjoiY2lzbjl6MDQzMDRkNzJxbXhyZWZ1aTlocCJ9.-xsBhulirrT0nMom_Ay9Og';
                }
                var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, Imagery © <a href="http://mapbox.com">Mapbox</a>';
                var grayLayer = L.tileLayer(grayStyle, {attribution: attribution});
                grayLayer.addTo(map);
            }

            function closePopup() {
                map.closePopup();
            }

            function getStreetName(name) {
                var streetName = hasNumber(name)?name.substring(0, name.length - 1):name;
                switch(streetName) {
                    case 'Apoquindo':
                        return 'Apoquindo';
                        break;
                    case 'Bilbao':
                        return 'Bilbao';
                        break;
                    case 'CaminoMelipilla':
                        return 'Camino Melipilla';
                        break;
                    case 'Colon':
                        return 'Colón';
                        break;
                    case 'CSur':
                        return 'Costanera Sur';
                        break;
                    case 'GranAvenida':
                        return 'Gran Avenida';
                        break;
                    case 'Grecia':
                        return 'Grecia';
                        break;
                    case 'Independencia':
                        return 'Independencia';
                        break;
                    case 'Infante':
                        return 'Infante';
                        break;
                    case 'Irarrazaval':
                        return 'Irarrázaval';
                        break;
                    case 'JJPerez':
                        return 'J.J. Pérez';
                        break;
                    case 'LaFlorida':
                        return 'La Florida';
                        break;
                    case 'LasCondes':
                        return 'Las Condes';
                        break;
                    case 'Pajaritos':
                        return 'Pajaritos';
                        break;
                    case 'Provi':
                        return 'Providencia';
                        break;
                    case 'Quilicura':
                        return 'Quilicura';
                        break;
                    case 'Recoleta':
                        return 'Recoleta';
                        break;
                    case 'SanPablo':
                        return 'San Pablo';
                        break;
                    case 'SantaRosa':
                        return 'Santa Rosa';
                        break;
                    case 'Tobalaba':
                        return 'Tobalaba';
                        break;
                    case 'TunelSC':
                        return 'Túnel San Cristóbal';
                        break;
                    case 'V.Mackenna':
                        return 'Vicuña Mackenna';
                        break;
                }
            }

            function hasNumber(name) {
                var matches = name.match(/\d+/g);
                if (matches != null) {
                    return true;
                } else {
                    return false;
                }
            }


    	    

            $(".leaflet-control").hide();
    	    $(".leaflet-control-attribution").show();

            $(".bubble").hide();

    	    socket.on('axis', function(msg){
                console.log(msg);
	          updateMap(msg.axis,msg.status);
	        });

            socket.on('mapstyle', function(msg) {
                setStyle(msg.style);
            });

            // Add poits of interest to map
            var POIsOverlay = L.layerGroup([]);
            POIsOverlay.addTo(map);
            mapControl.addOverlay(POIsOverlay, 'POIs');
            var estacionesArr = [];

            fillMap();

            for (var i=0; i<$(".contenido-twitter .owl-carousel").find(".item").length; i++) {
               $(".contenido-twitter .owl-carousel").trigger('remove.owl.carousel', [i])
                                         .trigger('refresh.owl.carousel');
            }

            updateRRSS();

            function updateRRSS() {
                $(".contenido-twitter .owl-carousel .item").removeAttr("revised");
                $.get('/rrss/get/selected/',{},function(tweets) {
                    tweets.forEach(function(tweet) {
                        if($(".contenido-twitter .owl-carousel").find(".item[data-id='"+tweet._id+"']").length==0) {
                            $tweetObj = $(`
                            <li class="item" data-id="`+tweet._id+`" revised="true">
                                <div class="capsula-tw">
                                    <!-- Tweet normal -->
                                    <div class="top">
                                        <div class="contenedor-foto">
                                            <div class="foto-tw" style="background: url(`+tweet.user.profile_image_url+`) no-repeat center center; background-size: cover;">
                                            </div>
                                        </div>
                                        <div class="creditos-tw">
                                            <div class="nombre-usuario">
                                                <h3>@`+tweet.user.screen_name+`</h3>
                                            </div>
                                            <div class="ubicacion">
                                                <p><i class="icono-geolocalizador"></i>`+tweet.user.location+`</p>
                                            </div>
                                        </div>
                                        <div class="botones-media">
                                            <span class="video"><i class="icono-video"></i></span>
                                            <span class="foto"><i class="icono-foto"></i></span>
                                            <span class="gif"><i class="icono-gif"></i></span>
                                            <span class="carousel-image"><i class="icono-carousel-image"></i></span>
                                        </div>
                                    </div>
                                    <div class="bottom">
                                        <div class="comentario-tw">
                                            <p>`+tweet.text+`</p>
                                        </div>
                                    </div>
                                    <!-- Media Foto -->
                                    <div class="contenedor-foto-tweet">
                                        <div class="foto-tweet" style="background: url(imagenes/tweet-foto.jpg) no-repeat center center; background-size: cover;"></div>
                                        <span class="cerrar-media"><i class="icono-cerrar"></i></span>
                                    </div>
                                    <!-- Media Video -->
                                    <div class="contenedor-video-tweet">
                                        <div class="video-tweet"><video width="560" height="315">
                                        <source src="" type="video/mp4" />
                                        </video> </div>
                                        <span class="cerrar-media"><i class="icono-cerrar"></i></span>
                                        <span class="video-play"><i class="icono-video"></i></span>
                                    </div>
                                    <!-- Logo -->
                                    <div class="social-hound-watermark">
                                        <img src="/imagenes/socialhound-w.png">
                                    </div>
                                </div>
                            </li>`);
                            $tweetObj.find("span.video").hide();
                            $tweetObj.find("span.foto").hide();
                            $tweetObj.find("span.gif").hide();
                            $tweetObj.find("span.carousel-image").hide();
                            $tweetObj.find(".contenedor-foto-tweet").hide();
                            $tweetObj.find(".contenedor-video-tweet").hide();

                            if(tweet.hasOwnProperty("extended_entities")) {
                                if(tweet.extended_entities.hasOwnProperty("media")) {
                                    //Tiene media. Debemos verificar si es 1 o varios
                                    var countmedia = 0;
                                    tweet.extended_entities.media.forEach(function(media) {
                                        if(media.show) countmedia++;
                                    });
                                    if(countmedia>0) {
                                        tweet.extended_entities.media.forEach(function(media) {
                                          if(media.show) {
                                           if(media.type=="photo") {
                                                $tweetObj.find(".contenedor-foto-tweet .foto-tweet").css('background-image','url("'+media.media_url+'")');
                                                $tweetObj.find("span.foto").show().click(function() {
                                                    $(this).closest(".capsula-tw").find(".top").hide();
                                                    $(this).closest(".capsula-tw").find(".bottom").hide();
                                                    $(this).closest(".capsula-tw").find(".contenedor-foto-tweet").fadeIn(255);
                                                });
                                           } 
                                           if(media.type=="video") {
                                                var selectedVideo = '';
                                                var lastBitrate = 0;
                                                media.video_info.variants.forEach(function(variant) {
                                                    if(variant.hasOwnProperty("bitrate")) {
                                                        if(variant.bitrate>lastBitrate) {
                                                            lastBitrate = variant.bitrate;
                                                            selectedVideo = variant.url;
                                                        }
                                                    }
                                                });
                                                $tweetObj.find(".contenedor-video-tweet .video-tweet video source").attr('src',selectedVideo);
                                                $tweetObj.find("span.video").show().click(function() {
                                                    $(this).closest(".capsula-tw").find(".contenedor-video-tweet .video-play").click(function() {
                                                        var $playbtn = $(this);
                                                        $playbtn.fadeOut(255,function() {
                                                            var vid = $(this).closest(".capsula-tw").find("video")[0];
                                                            vid.play();
                                                            vid.addEventListener('ended', function () {
                                                              this.currentTime = 0;
                                                              $playbtn.fadeIn(500);
                                                            }, false);
                                                        })
                                                    });
                                                    $(this).closest(".capsula-tw").find(".top").hide();
                                                    $(this).closest(".capsula-tw").find(".bottom").hide();
                                                    $(this).closest(".capsula-tw").find(".contenedor-video-tweet").fadeIn(255);
                                                });
                                           }
                                           if(media.type=="animated_gif") {
                                                $tweetObj.find(".contenedor-video-tweet .video-tweet video source").attr('src',media.video_info.variants[0].url);
                                                $tweetObj.find("span.gif").show().click(function() {
                                                    $(this).closest(".capsula-tw").find(".contenedor-video-tweet .video-play").hide();
                                                    var vid = $(this).closest(".capsula-tw").find("video")[0]; 
                                                    if (typeof vid.loop == 'boolean') { // loop supported
                                                      vid.loop = true;
                                                    } else { // loop property not supported
                                                      vid.addEventListener('ended', function () {
                                                        this.currentTime = 0;
                                                        this.play();
                                                      }, false);
                                                    }
                                                    vid.play();
                                                    $(this).closest(".capsula-tw").find(".top").hide();
                                                    $(this).closest(".capsula-tw").find(".bottom").hide();
                                                    $(this).closest(".capsula-tw").find(".contenedor-video-tweet").fadeIn(255);
                                                });
                                            }
                                          }
                                        });
                                    }
                                }
                            }

                            $tweetObj.find(".cerrar-media").click(function() {
                                $(this).closest(".capsula-tw").find(".top").show();
                                $(this).closest(".capsula-tw").find(".bottom").show();
                                $(this).closest(".capsula-tw").find(".contenedor-foto-tweet").hide();
                                $(this).closest(".capsula-tw").find(".contenedor-video-tweet").hide();
                            });

                            $(".contenido-twitter .owl-carousel")
                              .owlCarousel('add', $tweetObj)
                              .owlCarousel('update')
                        } else {
                            $(".contenido-twitter .owl-carousel").find(".item[data-id='"+tweet._id+"']").attr("revised","true");

                        }
                    });
                    
                    
                    for (var i=0; i<$(".contenido-twitter .owl-carousel").find(".item").length; i++) {
                        var attr = $(".contenido-twitter .owl-carousel .item").eq(i).attr('revised');
                        // For some browsers, `attr` is undefined; for others,
                        // `attr` is false.  Check for both.
                        if (typeof attr === typeof undefined) {
                            $(".contenido-twitter .owl-carousel").trigger('remove.owl.carousel', [i])
                                                      .trigger('refresh.owl.carousel');
                        }
                    }

                    //$(".contenido-twitter .owl-carousel .item:not([revised])").parent(".owl-item").remove();
                    $(".contenido-twitter .owl-carousel").trigger('refresh.owl.carousel');
                });
            }

            socket.on('newtweet',function(msg) {
                updateRRSS();
            });

            socket.on('deletetweet',function(msg) {
                updateRRSS();
            });

            socket.on('updatetweet',function(msg) {
                console.log(msg);
                $(".item[data-id='"+msg.tweet+"']").find(".tweet-foto");
                window.location.reload();
            });

            socket.on('deletedevent', function(msg) {
                var delta;
                        switch(msg.linea) {
                            case '1':
                                delta = '10';
                                break;
                            case '2':
                                delta = '20';
                                break;
                            case '4':
                                delta = '40';
                                break;
                            case '4A':
                                delta = '45';
                                break;
                            case '5':
                                delta = '50';
                                break;
                            case '6':
                                delta = '60';
                                break;
                        }
                  var layer = POIsOverlay.getLayer(parseInt(delta+msg.estacion.toString()));
                  map.removeLayer(layer);
                $(".bubble[data-linea='"+msg.linea+"']").fadeOut(250);
            });

            //Esconder boton twitter inicialmente
            socket.emit('toggletwitter',{show:false});

            socket.on('toggletwitter', function(msg) {
                if(msg.show) {
                    $("#twitter").css("left","-2px");
                } else {
                    if($(".twitter-slider").hasClass("mostrar")) {
                        $('.twitter-slider').toggleClass('oculto mostrar');
                    }
                    $("#twitter").css("left","-100px");
                }
            });

            socket.on('newevent', function(msg) {
                $.get('/metro/get/estaciones/'+msg.estacionid+'/true',{},function(estaciones){
                    console.log(estaciones);
                    estaciones.forEach(function(estacion) {
                        var markerHTML = `<div class="tooltip linea-`+msg.linea+`">
                                        <div class="toltip-metro">
                                            <div class="left evento">
                                                <div class="icono-evento"><i class="icono-evento-`+msg.evento+`"></i></div>
                                                <div><h2>`+getNameEvento(msg.evento)+` </h2></div>
                                            </div>
                                            <div class="right info">
                                                <div class="metro-info">
                                                    <div class="contenedor-icono-metro">
                                                        <i class="icono-logometro"></i>
                                                    </div>
                                                    <div class="info">
                                                        <h3>Linea `+msg.linea+`</h3>
                                                        <p>`+msg.estacion+`</p>
                                                    </div>
                                                </div>
                                                <div class="mas-info">
                                                    <div class="tiempo-retraso">
                                                        <p><i class="icono-reloj"></i> `+msg.horasRetraso+`<span></span>`+msg.minutosRetraso+` <span>min. de retraso</span></p>
                                                    </div>`;
                        if(msg.infoAdicional!='') {
                            markerHTML += `<div class="info-adicional on">
                                                        <p><i class="icono-info"></i> `+msg.infoAdicional+`</p>
                                                    </div>`;
                        }
                            markerHTML += `   
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flecha-before-metro"></div><div class="flecha-after-metro"></div>
                                    </div>`;

                        var marker = L.marker([parseFloat(estacion.lat), parseFloat(estacion.lng)], {
                            icon: L.icon({
                                iconUrl: '/imagenes/metro.png',
                                iconSize: [40, 40]
                            })
                        }).bindPopup(markerHTML,{closeButton: false});
                        var delta;
                        switch(msg.linea) {
                            case '1':
                                delta = '10';
                                break;
                            case '2':
                                delta = '20';
                                break;
                            case '4':
                                delta = '40';
                                break;
                            case '4A':
                                delta = '45';
                                break;
                            case '5':
                                delta = '50';
                                break;
                            case '6':
                                delta = '60';
                                break;
                        }
                        marker._leaflet_id = parseInt(delta+estacion._id.toString());
                        estacionesArr.push(marker);
                        marker.on('click', function(e) {
                            $(".tooltip").unbind("click");
                            $(".tooltip").click(function() {
                                map.closePopup();
                            });
                        });

                        POIsOverlay.addLayer(marker);

                        $(".tooltip").unbind("click");
                        $(".tooltip").click(function() {
                            map.closePopup();
                        });
                    });
                });

                var last = parseInt($(".bubble[data-linea='"+msg.linea+"'] .alertas p").text());
                $(".bubble[data-linea='"+msg.linea+"'] .alertas p").text(last+1);
                $(".bubble[data-linea='"+msg.linea+"']").addClass("animated infinite pulse").fadeIn(250);
                $(".bubble[data-linea='"+msg.linea+"']").unbind("click");
                $(".bubble[data-linea='"+msg.linea+"']").click(function() {
                    $(this).fadeOut(250);
                    var delta;
                    switch(msg.linea) {
                        case '1':
                            delta = '10';
                            break;
                        case '2':
                            delta = '20';
                            break;
                        case '4':
                            delta = '40';
                            break;
                        case '4A':
                            delta = '45';
                            break;
                        case '5':
                            delta = '50';
                            break;
                        case '6':
                            delta = '60';
                            break;
                    }
                    var layer = POIsOverlay.getLayer(parseInt(delta+msg.estacionid.toString()));
                    //fire event 'click' on target layer 
                    //layer.fireEvent('click');  

                    var estacionLocation = L.latLng(parseFloat(msg.lat)+0.007, msg.lng);
                    map.setView(estacionLocation, 15.49, {
                      "animate": true,
                      "pan": {
                        "duration": 1
                      }
                    });
                });
            });

            socket.on('restart', function(msg) {
                location.reload();
            });
});

function getNameEvento(evento) {
    switch(evento) {
        case "falla-electrica":
            return "Falla Eléctrica";
            break;
        case "inundacion":
            return "Inundación";
            break;
        case "objeto-sospechoso":
            return "Objeto Sospechoso";
            break;
        case "falla-mecanica":
            return "Falla Mecánica";
            break;
        case "desastre-natural":
            return "Desastre Natural";
            break;
        case "disturbios":
            return "Disturbios";
            break;
        case "estacion-cerrada":
            return "Estación Cerrada";
            break;
        case "servicio-restablecido":
            return "Servicio Restablecido";
            break;
        case "alerta-generica":
            return "Alerta";
            break;
    }
}