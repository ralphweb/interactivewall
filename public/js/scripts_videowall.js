var intervalCarousel = null;
var autocarousel = false;
var autotime = 0;
/*
var emoji = new EmojiConvertor();
emoji.path = 'https://unicodey.com/js-emoji/build/emoji-data/img-emojione-64/';
emoji.sheet = 'https://unicodey.com/js-emoji/build/emoji-data/sheet_emojione_64.png';
emoji.use_sheet = true;
emoji.replace_mode = 'unified';
emoji.init_env();
*/

$(function() {
    $(".carousel-inner").empty();
	loadData(function() {
		//
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
        $('.container.top').find(".count").text(formatNumber.new(msg.count));
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
        	    var $tweetObj = $(`
        	    	<div class="carousel-item" data-id="`+tweet._id+`" revised="true">
        	    		<div class="box-tuit">
        	    			<div class="card social-card">
        	    				<div class="card-body pt-3">
                                    <div class="perfil-usuario text-center">
            	    					<span class="autor-avatar">
            	    						<img class="card-img-top" src="`+tweet.author.profile_pic+`" alt="Card image cap">
            	    					</span>
            	    					<span class="autor-name text-left">
            	    						<a href="#">
            	    							<h4 class="card-title">`+tweet.author.name+`</h4>
            	    							<!--h6 class="card-subtitle mb-2">@`+tweet.author.username+`</h6-->
            	    						</a>
            	    					</span>
                                    </div>
        	    					<span class="autor-text text-center">
        	    						<p class="card-text">`+tweet.title+`</p>
        	    					</span>
                                    <div class="red-activa text-center">
                                        <span class="autor-rss rss-vertigo">
                                            <a href="#" class="media-pic photo" data-toggle="modal" data-target="#`+tweet._id+`">
                                                <i class="fa fa-picture-o" aria-hidden="true"></i>
                                            </a>
                                            <a href="#" class="watermark">
                                               
                                            </a>
                                        </span>
                                    </div>
        	    				</div>
        	    			</div>
        	    		</div>
        	    	</div>
        	    	`);
        	    $tweetObj.find(".media-pic").hide();
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
                                    //Agregamos el modal
                                    var $modal = $(`
                                        <div class="modal fade" id="`+tweet._id+`" tabindex="-1" role="dialog" aria-hidden="true">
                                            <div class="modal-dialog modal-lg" role="document">
                                                <div class="modal-content">
                                                    <div class="modal-body img-body">
                                                        <img src="`+media.media_url+`">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        `);
                                    $(".modal-wrapper").append($modal);
        	                        $tweetObj.find(".media-pic").show();
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
        	    $(".carousel-inner").append($tweetObj);
        	} else {
                //edited?
                $(".carousel-inner").find(".carousel-item[data-id='"+tweet._id+"']").find(".card-title").html(tweet.author.name);
                $(".carousel-inner").find(".carousel-item[data-id='"+tweet._id+"']").find(".card-text").html(tweet.title);
                $(".carousel-inner").find(".carousel-item[data-id='"+tweet._id+"']").attr("revised","true");
            }
        });

        $('.carousel').carousel('dispose');

        for (var i=0; i<$(".carousel-inner").find(".carousel-item").length; i++) {
            var attr = $(".carousel-inner").find(".carousel-item").eq(i).attr('revised');
            // For some browsers, `attr` is undefined; for others,
            // `attr` is false.  Check for both.
            if (typeof attr === typeof undefined) {
                $(".carousel-inner").find(".carousel-item").eq(i).remove();
            }
        }

        $(".carousel-inner").find(".carousel-item").removeAttr("revised");

        /*
        $(".carousel-inner").find(".carousel-item").removeClass("active");
        $(".carousel-inner").find(".carousel-item").eq(0).addClass("active");
        */
        if(!$(".carousel-inner").find(".carousel-item.active").length) {
            $(".carousel-inner").find(".carousel-item").eq(0).addClass("active");
        }


        $('.carousel').carousel({
            interval: false,

        });

        $('.carousel').on('slid.bs.carousel', function () {
          var index = $(".carousel-item.active").index();
          socket.emit('carouselcurrentres',{index:index,autocarousel:autocarousel,time:autotime,topic:topic});
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