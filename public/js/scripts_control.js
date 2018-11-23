var intervalCount = null;
$(function() {
	$(".carousel-inner").empty();
	loadData(function() {
		$('.carousel').carousel({
			interval: false
		});

		socket.emit("carouselcurrentreq",{topic:topic});
	});

    socket.on('connect', function() {
       setTimeout(function() {
                   socket.emit('room', topic);
               },2000);
    });

	socket.on('carouselnext',function(msg) {
		$('.carousel').carousel('next');
	});

	socket.on('carouselprev',function(msg) {
		$('.carousel').carousel('prev');
	});

	socket.on('carouselcurrentres',function(msg) {
        console.log(msg);
		$('.carousel').carousel(msg.index);
        if(msg.autocarousel) $(".toggle input[type='checkbox']").prop("checked",true).change();
        else $(".toggle input[type='checkbox']").prop("checked",false).change();
        $(".autotime").val(parseInt(msg.time));
	});

	socket.on('carouselmedia',function(msg) {
	    var open = msg.open;
	    if(open) $("#"+msg.id).modal("show");
	    else $("#"+msg.id).modal("hide");
	});

	socket.on('newtweet',function(msg) {
		loadData(function() {
			$('.carousel').carousel({
				interval: false
			});
		})
	});

	startEvents();
});

function startEvents() {
	getCount(topic);
	clearInterval(intervalCount);
	intervalCount = setInterval(function() {
		getCount(topic);
	},5000);

    $(".toggle input[type='checkbox']").unbind("change");
    $(".toggle input[type='checkbox']").change(function() {
        var checked = $(".toggle input[type='checkbox']").is(":checked");
        var time = parseInt($(".autotime").val());
        socket.emit('carouselauto',{time:time,auto:checked,topic:topic});
    });

    $(".toggle-contador").unbind("click");
    $(".toggle-contador").bind("click",function() {
        console.log('togglecontador');
        socket.emit('togglecontador',{topic:topic});
    });
}

function getCount(topic) {
	$.get('https://api.social-hound.com/count/'+topic,function(contador) {
		console.log(contador);
		$("text.count").html(contador.data[0].total);
        socket.emit("count",{topic:topic,count:contador.data[0].total});
	})
}

function prevSlide() {
	socket.emit("carouselprev",{topic:topic});
}

function nextSlide() {
	socket.emit("carouselnext",{topic:topic});
}

function loadData(callback) {
	$.get('https://api.social-hound.com/'+topic+'/mentions/selected/true',{},function(data) {
        data.forEach(function(tweet) {
        	if($(".carousel-inner").find(".carousel-item[data-id='"+tweet._id+"']").length==0) {
        	    var $tweetObj = $(`
        	    	<div class="carousel-item" data-id="`+tweet._id+`" revised="true">
        	    		<div class="box-tuit">
        	    			<div class="card social-card">
        	    				<div class="card-body pt-3">
        	    					<span class="autor-rss rss-vertigo">
        	    						<a href="#">
        	    							<i class="fa fa-twitter" aria-hidden="true"></i>
        	    						</a>
        	    					</span>
        	    					<span class="autor-avatar">
        	    						<img class="card-img-top" src="`+tweet.author.profile_pic+`" alt="Card image cap">
        	    					</span>
        	    					<span class="autor-name">
        	    						<a href="#">
        	    							<h4 class="card-title">`+tweet.author.name+`</h4>
        	    							<h6 class="card-subtitle mb-2">@`+tweet.author.username+`</h6>
        	    						</a>
        	    					</span>
        	    					<span class="autor-text">
        	    						<p class="card-text">`+tweet.title+`</p>
        	    					</span>
        	    				</div>
        	    			</div>
        	    			<div class="btn-image text-center">
        	    				<button class="media-pic" data-toggle="modal" data-target="#`+tweet._id+`">
        	    					<i class="fa fa-picture-o" aria-hidden="true"></i>
        	    				</button>
        	    			</div>
        	    		</div>
        	    	</div>
        	    	`);
        	    $tweetObj.find(".btn-image").hide();
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
                                    $('#'+tweet._id).on('hidden.bs.modal', function (e) {
                                      socket.emit("carouselmedia",{id:tweet._id,open:false,topic:topic});
                                    })
                                    //$(".modal").modal();
        	                        $tweetObj.find(".btn-image").show().click(function() {
        	                        	socket.emit("carouselmedia",{id:tweet._id,open:true,topic:topic});
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
        	    $(".carousel-inner").append($tweetObj);
        	} else {
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

        callback();
    });
}