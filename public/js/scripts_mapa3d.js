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
window.offset = 80;

/* MAPA */
var map;
var globalcenter = [36.057944835, -112.18688965];
var globalzoom = 4;
var markerGroup = [];
var markerElements = [];
var markerHasMedia = [];
var index = -1;

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
  let popup = markerElements[index];
  coords[0] = parseFloat(coords[0]);
  coords[1] = parseFloat(coords[1]);
  let scoords = [];
  if(!markerHasMedia[index]) {
    coords[0] = coords[0]+15; //eje y
    coords[1] = coords[1]+13; //eje x
    scoords[0] = coords[0]>0?coords[0]-24:coords[0]-24;
    scoords[1] = coords[1]>0?coords[1]-32:coords[1]-32;
  } else {
    if(markerHasMedia[index]=="image") {
      coords[0] = coords[0]+17; //eje y
      coords[1] = coords[1]+13; //eje x
      scoords[0] = coords[0]>0?coords[0]-24:coords[0]-24;
      scoords[1] = coords[1]>0?coords[1]-32:coords[1]-32;
    }
    if(markerHasMedia[index]=="video") {
      coords[0] = coords[0]+22; //eje y
      coords[1] = coords[1]+13; //eje x
      scoords[0] = coords[0]>0?coords[0]-24:coords[0]-24;
      scoords[1] = coords[1]>0?coords[1]-32:coords[1]-32;
    }
  } 
  console.log("coords"); 
  console.log(coords);  
  console.log("scoords"); 
  console.log(scoords); 
  map.panInsideBounds([coords, scoords],
          {heading: 0, tilt: 5, duration: 2});
}

$(function() {
  map = WE.map('map', {
    center: globalcenter,
    zoom: globalzoom,
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

    $(".carousel-inner").empty();
    loadData(function() {
    });

    socket.on('connect', function() {
        console.log(topic);
       socket.emit('room', topic);
    });

  socket.on('carouselnext',function(msg) {
    console.log('next');
    if(index>=0) {
      try {
        $("video:visible")[0].pause();
        $("video:visible")[0].currentTime = 0;
      } catch(e) {
        console.log(e);
      }
      markerElements[index].closePopup();
    }
    index = index<markerGroup.length-1?index+1:0;
    markerElements[index].openPopup();
    panTo(markerGroup[index]);
    try {
      setTimeout(function() {
        $("video:visible")[0].play();
      },2000);
    } catch(e) {
      console.log(e);
    }
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
        $('.contador-mapa').find(".count").text(formatNumber.new(msg.count));
    });

  socket.on('carouselprev',function(msg) {
    console.log('prev');
    if(index>=0) {
      try {
        $("video:visible")[0].pause();
        $("video:visible")[0].currentTime = 0;
      } catch(e) {
        console.log(e);
      }
      markerElements[index].closePopup();
    }
    index = index>0?index-1:markerGroup.length-1;
    markerElements[index].openPopup();
    panTo(markerGroup[index]);
    try {
      setTimeout(function() {
        $("video:visible")[0].play();
      },2000);
    } catch(e) {
      console.log(e);
    }
  });

    socket.on('carouselcurrentreq',function(msg) {
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
                if(index>=0) markerElements[index].closePopup();
                index = index<markerGroup.length-1?index+1:0;
                markerElements[index].openPopup();
                panTo(markerGroup[index]);
            },time);
        } else if(!auto&&intervalCarousel!=null) {
            clearInterval(intervalCarousel);
            autocarousel = false;
            intervalCarousel = null;
            socket.emit('carouselcurrentres',{index:index,autocarousel:autocarousel,time:autotime,topic:topic});
        }
    })

  socket.on('newtweet',function(msg) {
    location.reload();
  });

    socket.on('deletetweet',function(msg) {
        location.reload();
    });

    socket.on('updatetweet',function(msg) {
        location.reload();
    });
});

function next() {
  console.log('next');
  if(index>=0) { 
    try {
      $("video:visible")[0].pause();
      $("video:visible")[0].currentTime = 0;
    } catch(e) {
      console.log(e);
    }
    markerElements[index].closePopup();
  }
  index = index<markerGroup.length-1?index+1:0;
  markerElements[index].openPopup();
  panTo(markerGroup[index]);
  try {
    setTimeout(function() {
      $("video:visible")[0].play();
    },2000);
  } catch(e) {
    console.log(e);
  }
}

function loadData(callback) {
  markerGroup = [];
  markerElements = [];
  $.get('https://api.social-hound.com/'+topic+'/mentions/selected/true/hidden/false/channel/map',{},function(data) {
        data.forEach(function(tweet) {
          if($(".carousel-inner").find(".carousel-item[data-id='"+tweet._id+"']").length==0) { 
              if(tweet.hasOwnProperty("geo")) {
                  var marker = WE.marker(tweet.geo,'/images/icon_back.png').addTo(map);
                  markerGroup.push(tweet.geo);
                  let $popup = $(`
                <div class="row">
                  <div class="col-sm-12 mention-card newpopup" data-id="`+tweet._id+`">
                    <div class="card">
                      <div class="card-body">
                        <div class="row align-items-center mb-3 card-head">
                          <div class="col-avatar">
                            <a class="avatar avatar-sm" href="profile-posts.html"><img alt="..." class="avatar-img rounded-circle" src="`+tweet.author.profile_pic+`"></a>
                          </div>
                          <div class="col ml--9">
                            <h5 class="card-title m-0 p-0">`+tweet.author.name+`</h5>
                            <h6 class="card-subtitle text-muted m-0 p-0" style="`+(tweet.author.username==undefined?"display:none":"")+`">`+tweet.author.username+`</h6>
                          </div>
                          <div class="col-auto platform">
                            <h5 class="bg-twitter"><a href="`+tweet.url+`" target="_blank"><i class="fab fa-`+tweet.platform+`"></i></a></h5>
                          </div>
                        </div>
                        <p class="card-text">`+tweet.title+`</p>
                        <h6 class="card-subtitle text-muted m-0 p-0 location" style="`+(tweet.location==undefined?"display:none":"")+`"><i class="fas fa-map-marker-alt"></i>&nbsp;`+tweet.location+`</h6>
                      </div>
                    </div>
                  </div>
                </div>`);

                  
                  if(tweet.hasOwnProperty("video")){
                    $popup.find(".mention-card").removeClass("col-sm-12").addClass("col-sm-5");
                    $popup.prepend(`<video type="video/mp4" ref="video" src="`+tweet.video+`" autoplay></video>`);
                    markerHasMedia.push("video");
                    marker.bindPopup($popup.html(), {maxWidth: 1120, closeButton: false});
                  } else if(tweet.hasOwnProperty("image")) {
                    $popup.find(".mention-card").removeClass("col-sm-12").addClass("col-sm-5");
                    $popup.prepend(`<div class="col-sm-7 image"><img src="`+tweet.image+`"></div>`);
                    markerHasMedia.push("image");
                    marker.bindPopup($popup.html(), {maxWidth: 800, closeButton: false});
                  } else {
                    markerHasMedia.push(false);
                    marker.bindPopup($popup.html(), {maxWidth: 800, closeButton: false});
                  }
                  markerElements.push(marker);
              }    
          }
        })
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