var intervalCarousel = null;
var autocarousel = false;
var autotime = 0;
var emoji = new EmojiConvertor();
emoji.path = 'https://unicodey.com/js-emoji/build/emoji-data/img-emojione-64/';
emoji.sheet = 'https://unicodey.com/js-emoji/build/emoji-data/sheet_emojione_64.png';
emoji.use_sheet = true;
emoji.replace_mode = 'unified';
emoji.init_env();

var mentions;

/* MAPA */
var map;
var markers;

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

$(function() {
  map = WE.map('map', {
    center: [36.057944835, -112.18688965],
    zoom: 4,
    dragging: true,
    scrollWheelZoom: true
  });

  // setup a marker group
  markers = WE.markerClusterGroup();

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

    $(".carousel-inner").empty();
      loadData(function() {
    });

    socket.on('connect', function() {
        console.log(topic);
       socket.emit('room', topic);
    });

  socket.on('carouselnext',function(msg) {
        console.log("next");
    $('.carousel').carousel('next');
  });

    socket.on('togglecontador',function(msg) {
        $('.container').toggleClass('active');
        if($(".logovideo").hasClass("active")) {
            var vid = $(".logovideo")[0];
            vid.currentTime = 0;
            vid.play();
        }
    });

    socket.on('count',function(msg) {
        console.log('count');
        $('.container.top').find("h1 text").text(formatNumber.new(msg.count));
    });

  socket.on('carouselprev',function(msg) {
        console.log("prev");
    $('.carousel').carousel('prev');
  });

    socket.on('carouselcurrentreq',function(msg) {
        var index = $(".carousel-item.active").index();
        socket.emit('carouselcurrentres',{index:index,autocarousel:autocarousel,time:autotime,topic:topic});
    });

    socket.on('carouselmedia',function(msg) {
        var open = msg.open;
        if(open) $("#"+msg.id).modal("show");
        else $("#"+msg.id).modal("hide");
    });

    socket.on('carouselauto',function(msg) {
        var time = msg.time;
        var auto = msg.auto;
        autotime = time;
        if(auto&&intervalCarousel==null) {
            autocarousel = true;
            intervalCarousel = setInterval(function() {
                $('.carousel').carousel('next');
            },time);
        } else if(!auto&&intervalCarousel!=null) {
            clearInterval(intervalCarousel);
            autocarousel = false;
            intervalCarousel = null;
            var index = $(".carousel-item.active").index();
            socket.emit('carouselcurrentres',{index:index,autocarousel:autocarousel,time:autotime,topic:topic});
        }
    })

  socket.on('newtweet',function(msg) {
    loadData(function() {
            //
    })
  });

    socket.on('deletetweet',function(msg) {
        loadData(function() {
            //
        })
    });

    socket.on('updatetweet',function(msg) {
        loadData(function() {
            //
        })
    });
});

function loadData(callback) {
  $.get('https://api.social-hound.com/'+topic+'/mentions/selected/true',{},function(data) {
        data.forEach(function(tweet) {
          if($(".carousel-inner").find(".carousel-item[data-id='"+tweet._id+"']").length==0) { 
              if(tweet.hasOwnProperty("geo")) {
                  var marker = WE.marker(tweet.geo)
                  // add marker
                  markers.addLayer(marker);

                  marker.bindPopup("<b>"+tweet.author.name+"</b><br><span style='font-size:10px;color:#999'>"+tweet.author.username+"</span>"+tweet.title+"<br />", {maxWidth: 150, closeButton: true}).openPopup();
              }    
          }
        })

        // add the group to the map
        // for more see https://github.com/Leaflet/Leaflet.markercluster
        map.addLayer(markers);
        callback();
    });
}

var formatNumber = {
     separador: ".", // separador para los miles
     sepDecimal: ',', // separador para los decimales
     formatear:function (num){
         num += '';
         var splitStr = num.split('.');
         var splitLeft = splitStr[0];
         var splitRight = splitStr.length > 1 ? this.sepDecimal + splitStr[1] : '';
         var regx = /(\d+)(\d{3})/;
         while (regx.test(splitLeft)) {
            splitLeft = splitLeft.replace(regx, '$1' + this.separador + '$2');
         }
         return this.simbol + splitLeft + splitRight;
     },
     new:function(num, simbol){
         this.simbol = simbol ||'';
         return this.formatear(num);
     }
}