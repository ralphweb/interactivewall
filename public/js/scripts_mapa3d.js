/* MAPA */
var map;
function init() {
  map = WE.map('map', {
    center: [36.057944835, -112.18688965],
    zoom: 4,
    dragging: true,
    scrollWheelZoom: true
  });

  //var baselayer = WE.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  var baselayer = WE.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    /*
    tileSize: 256,
    bounds: [[-85, -180], [85, 180]],
    minZoom: 0,
    maxZoom: 16,
    */
    id: 'satellite-streets-v9',
    accessToken: 'pk.eyJ1Ijoic29jaWFsLWhvdW5kIiwiYSI6ImNqcnNqY2NsYTJhcnQ0Ymw5bWozMzJvNTQifQ.6NxHDad1T1y85SnK8i46xw',
    attribution: '© OpenStreetMap contributors'/*,
    tms: true*/
  }).addTo(map);
}

function setZoom(zoom) {
  map.setZoom(zoom);
}

function getZoomLevel() {
  alert('Current zoom is: ' + Math.round(map.getZoom()));
}

function setPositionToEverest() {
  map.setView([27.988056, 86.925278]);
}

function getCurrentCenter() {
  alert(map.getCenter());
}

function flyToJapan() {
  map.fitBounds([[22, 122], [48, 154]]);
  map.panInsideBounds([[22, 122], [48, 154]],
          {heading: 90, tilt: 25, duration: 1});
}

function panTo(coords) {
  var marker = WE.marker(coords).addTo(map);
  marker.bindPopup("<b>Hello world!</b><br>I am a popup.<br /><span style='font-size:10px;color:#999'>Tip: Another popup is hidden in Cairo..</span>", {maxWidth: 150, closeButton: true}).openPopup();
  map.panTo(coords);
  let scoords = [];
  scoords[0] = coords[0]>0?coords[0]-24:coords[0]-24;
  scoords[1] = coords[1]>0?coords[1]-32:coords[1]-32;
  map.panInsideBounds([coords, scoords],
          {heading: 0, tilt: 25, duration: 2});
}