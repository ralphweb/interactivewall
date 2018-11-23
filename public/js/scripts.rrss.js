var pageEntrantes = 0;
var refreshInbox = null;
$(function() {
    $(".entrantes .panel-opciones").slideUp(250);
    $(".aprobados .contenedor-tweets").empty();
    $(".entrantes .contenedor-tweets").empty();
    loadTweets();

    socket.on('connect', function() {
       setTimeout(function() {
                   socket.emit('room', topic);
               },2000);
    });

    socket.on('toggletwitter', function(msg) {
        console.log(msg);
        $(".switch-input").prop("checked",msg.show);
    });
});

function loadTweets() {
    //refreshInbox = setInterval(loadTweets,30000);

    if(pageEntrantes==0) {
        $(".anterior-btn").prop("disabled",true).addClass("disabled");
    } else {
        $(".anterior-btn").prop("disabled",false).removeClass("disabled");
    }
        $.get('https://api.social-hound.com/'+topic+'/mentions/selected/true',{},function(data) {
            data.forEach(function(tweet) {
                if($(".aprobados .contenedor-tweets").find("[data-tweet-id='"+tweet._id+"']").length==0) {
                    $tweet = $(`<div class="tweet-entrante" data-tweet-id="`+tweet._id+`">
                            <div class="tweet">
                                <div class="fila contenido-tweet">
                                    <div class="columna foto">
                                        <div class="foto-usuario-twitter" style="background: url(`+tweet.author.profile_pic+`) no-repeat center center; background-size: cover;">
                                    </div>
                                </div>
                                <div class="columna usuario-comentario">
                                    <div class="nombre-usuario">
                                        <h3>`+tweet.author.name+`</h3>
                                    </div>
                                    <div class="fecha">
                                        <p><i class="icono-calendario"></i> `+tweet.captured_at+`</p>
                                    </div>
                                    <div class="comentario">
                                        <p>`+tweet.title+`</p>
                                    </div>
                                </div>
                                <div class="columna media-aprobados">
                                        <!-- contenido dinamico -->
                                </div>
                            </div>
                            <div class="botones">
                                <a class="eliminar-tweet" href="#"><i class="icono-cerrar"></i></a>
                            </div>
                        </div>
                    </div>`);
                    $tweet.find(".media-aprobados").hide();
                    if(tweet.hasOwnProperty("extended_entities")) {
                        if(tweet.extended_entities.hasOwnProperty("media")) {
                            //Tiene media. Debemos verificar si es 1 o varios
                            $tweet.find(".media-aprobados").show();
                            tweet.extended_entities.media.forEach(function(media) {
	                           if(media.type=="photo") {
	                                console.log("photo");
	                                var $photo = $(`<!-- Archivo 1 -->
	                                        <div class="contenedor-media">
	                                            <div class="media-tweet">
	                                                <a rel="`+tweet._id+`" href="`+media.media_url+`" alt="Foto de Usuario" class="media-image">
	                                                    <img src="`+media.media_url+`">
	                                                </a>
	                                            </div>
	                                            <label><input type="checkbox" value="" data-parent-id="`+tweet._id+`" data-src="`+media.media_url+`">Mostrar</label>
	                                        </div>`);
	                                $photo.find("[type='checkbox']").prop("checked",media.show);
	                                $tweet.find(".media-aprobados").append($photo);
	                           } 
	                           if(media.type=="video") {
	                                var $video = $(`<!-- Archivo 1 -->
	                                        <div class="contenedor-media">
	                                            <div class="media-tweet">
	                                                <a rel="`+tweet._id+`" href="`+media.media_url+`" alt="Foto de Usuario" class="media-image">
	                                                    <img src="`+media.media_url+`">
	                                                </a>
	                                            </div>
	                                            <label><input type="checkbox" value="" data-parent-id="`+tweet._id+`" data-src="`+media.media_url+`">Mostrar</label>
	                                        </div>`);
	                                $video.find("[type='checkbox']").prop("checked",media.show);
	                                $tweet.find(".media-aprobados").append($video);
	                           }
	                           if(media.type=="animated_gif") {
	                                console.log("animated_gif");
	                                var $gif = $(`<!-- Archivo 1 -->
	                                        <div class="contenedor-media">
	                                            <div class="media-tweet">
	                                                <a rel="`+tweet._id+`" href="`+media.media_url+`" alt="Foto de Usuario" class="media-image">
	                                                    <img src="`+media.media_url+`">
	                                                </a>
	                                            </div>
	                                            <label><input type="checkbox" value="" data-parent-id="`+tweet._id+`" data-src="`+media.media_url+`">Mostrar</label>
	                                        </div>`);
	                                $gif.find("[type='checkbox']").prop("checked",media.show);
	                                $tweet.find(".media-aprobados").append($gif);
	                           }
                            });
                        }
                    }
                    $(".aprobados .contenedor-tweets").append($tweet);
                }
            });
        });
        
        loadInbox();

        //var autoloadinbox = setInterval(loadInbox,30000);
}

function loadInbox() {
    $.get('https://api.social-hound.com/'+topic+'/mentions/selected/false',{},function(data) {
        var i=0;
        data.forEach(function(tweet) {
            if($(".entrantes .contenedor-tweets").find("[data-tweet-id='"+tweet._id+"']").length==0) {
                var $tweet = $(`<div class="columna tweet-entrante" data-tweet-id="`+tweet._id+`">
                                <div class="tweet">
                                    <div class="fila contenido-tweet">
                                        <div class="fila datos-usuario">
                                            <div class="columna foto">
                                                <div class="foto-usuario-twitter" style="background: url(`+tweet.author.profile_pic+`) no-repeat center center; background-size: cover;">
                                            </div>
                                            </div>
                                            <div class="columna fecha-ubicacion">
                                                <div class="nombre-usuario">
                                                    <h3>`+tweet.author.name+`</h3>
                                                </div>
                                                <div class="fecha">
                                                    <p><i class="icono-calendario"></i> `+tweet.captured_at+`</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="columna usuario-comentario">
                                            <div class="comentario">
                                                <p>`+tweet.title+`</p>
                                            </div>
                                        </div>
                                        <div class="columna media-entrantes">
                                            <!-- contenido dinamico -->
                                        </div>
                                    </div>
                                    
                                    <div class="botones">
                                        <form>
                                            <div class="boton-eliminar-tweet"><input type="checkbox" name="eliminar-tweet" /> Eliminar
                                            </div>
                                            <div class="boton-aprobar-tweet"><a class="aprobar-tweet" href="#"><i class="icono-aprobado"></i> Aprobar</a></div>
                                        </form>
                                    </div>
                                </div>
                            </div>`);
                $tweet.find(".media-entrantes").hide();
                if(tweet.hasOwnProperty("extended_entities")) {
                    if(tweet.extended_entities.hasOwnProperty("media")) {
                        //Tiene media. Debemos verificar si es 1 o varios
                        if(tweet.extended_entities.media.length==1) {
                            $tweet.find(".media-entrantes").show();
                            tweet.extended_entities.media.forEach(function(media) {
                               if(media.type=="photo") {
                                    console.log("photo");
                                    $photo = $(`<!-- Archivo 1 -->
                                            <div class="contenedor-media">
                                                <div class="media-tweet">
                                                    <a rel="`+tweet._id+`" href="`+tweet.extended_entities.media[0].media_url+`" alt="Foto de Usuario" class="media-image">
                                                        <img src="`+tweet.extended_entities.media[0].media_url+`">
                                                    </a>
                                                </div>
                                                <label><input type="checkbox" value="" data-parent-id="`+tweet._id+`" data-src="`+tweet.extended_entities.media[0].media_url+`">Mostrar</label>
                                            </div>`);
                                    $tweet.find(".media-entrantes").append($photo);
                               } 
                               if(media.type=="video") {
                                    console.log("video");
                               }
                               if(media.type=="animated_gif") {
                                    console.log("animated_gif");
                                }
                            });
                        } else {
                            //Tiene varios medios
                            $tweet.find(".media-entrantes").show();
                            if(tweet.extended_entities.media[0].type=='photo') {
                                console.log("multi photo");
                            } else {
                                console.log("type not supported");
                            }
                        }
                    }
                }
                $(".entrantes .contenedor-tweets").append($tweet);
                i++;
            }
        });
        initRRSSEvents();
        $(".loader").fadeOut(250);
    });
}

function initRRSSEvents() {
    $("contenedor-tweets .aprobados").sortable();

    $(".contenedor-media [type='checkbox']").unbind("change");
    $(".contenedor-media [type='checkbox']").change(function() {
    	var $checkbox = $(this);
        var checked = $checkbox.prop("checked");
        var target = encodeURIComponent($checkbox.attr("data-src"));
        var tweet = $checkbox.attr("data-parent-id");
        $.post('/rrss/post/update-media/'+tweet+'/'+target+'/'+checked, function(data) {
            console.log(data);
            /*
            if($checkbox.parents(".media-aprobados").length>0) {
	            socket.emit('updatetweet',{tweet:tweet,target:target,checked:checked});
	        }
	        */
        });
    });

    $("[name='eliminar-tweet']").unbind("change");
    $("[name='eliminar-tweet']").change(function() {
        var len = $("[name='eliminar-tweet']:checked").length;
        if(len>0) {
            $(".entrantes .panel-opciones").slideDown(250);
        } else {
            $(".entrantes .panel-opciones").slideUp(250);
        }
    });

    $(".aprobados .panel-opciones i.icono-cerrar").closest("a").unbind("click");
    $(".aprobados .panel-opciones i.icono-cerrar").closest("a").click(function() {
        var $tweetsToDelete = $(".aprobados .tweet-entrante").closest(".tweet-entrante");
        var idsToDelete = [];
        $tweetsToDelete.each(function(tweet) {
            idsToDelete.push($(this).attr("data-tweet-id"));
        });
        var r = confirm("Seguro que desea eliminar TODOS los Tweets?");
        if (r == true) {
            deleteRecursive(idsToDelete,0,function(){
                socket.emit('deletetweet',{type:'newtweet',topic:topic});
                console.log("all deleted");
            });
        } else {
            //cancel
        }
    });

    $(".aprobados .tweet-entrante i.icono-cerrar").closest("a").unbind("click");
    $(".aprobados .tweet-entrante i.icono-cerrar").closest("a").click(function() {
        var idToDelete = $(this).closest(".tweet-entrante").attr("data-tweet-id");
        var r = confirm("Seguro que desea eliminar el Tweet?");
        if (r == true) {
            $.ajax({
                type: 'PUT',
                url: 'https://api.social-hound.com/'+idToDelete+'/selected/false',
                contentType: 'application/json',
                data: JSON.stringify({}), // access in body
            }).done(function () {
                $(".tweet-entrante[data-tweet-id='"+idToDelete+"']").slideUp(255,function() {
                    socket.emit('deletetweet',{type:'newtweet',topic:topic});
                    $(this).remove();
                });
            });
        } else {
            //cancel
        }
    });

    $(".entrantes i.icono-cerrar").closest("a").unbind("click");
    $(".entrantes i.icono-cerrar").closest("a").click(function() {
        var $tweetsToDelete = $("[name='eliminar-tweet']:checked").closest(".tweet-entrante");
        var idsToDelete = [];
        $tweetsToDelete.each(function(tweet) {
            idsToDelete.push($(this).attr("data-tweet-id"));
        });
        deleteRecursive(idsToDelete,0,function(){
            console.log("all deleted");
        });
    });

    $(".boton-aprobar-tweet").unbind("click");
    $(".boton-aprobar-tweet").click(function() {
        var $obj = $(this);
        var idToApprove = $obj.closest(".tweet-entrante").attr("data-tweet-id");
        $.ajax({
            type: 'PUT',
            url: 'https://api.social-hound.com/'+idToApprove+'/selected/true',
            contentType: 'application/json',
            data: JSON.stringify({}), // access in body
        }).done(function () {
            $obj.closest(".tweet-entrante").slideUp(255,function() {
                //TO-DO: agregar a lista de aprobados
                socket.emit('newtweet',{type:'newtweet',topic:topic});
                console.log("aprobado");
                loadTweets();
            });
        }).fail(function (msg) {
            console.log("FAIL");
        });
    });

    $(".switch-input").unbind("change");
    $(".switch-input").change(function() {
        var isChecked = $(this).is(":checked");
        socket.emit('toggletwitter',{show:isChecked,topic:topic});
    });

    $('.media-image').modaal({
           type: 'image',
           after_open: function() {
                $(".modaal-gallery-item").each(function(index,element) {
                    var $element = $(element);
                    var picture = $element.find("img").attr("src");
                    var checked = $("[data-src='"+picture+"'").prop("checked");
                    if($element.find(`[data-src-secondary="`+picture+`"]`).length==0) {
                        var $checkbox = $(`<input type="checkbox" data-src-secondary="`+picture+`" name="nombre" class="checkbox">`);
                        if(checked) {
                            $checkbox.prop("checked",true);
                        } else {
                            $checkbox.prop("checked",false);
                        }
                        $element.append($checkbox);
                    } else {
                        if(checked) {
                            $element.find(`[data-src-secondary="`+picture+`"]`).prop("checked",true);
                        } else {
                            $element.find(`[data-src-secondary="`+picture+`"]`).prop("checked",false);
                        }
                    }
                });
                $(".modaal-gallery-item").find("[type='checkbox']").unbind("change");
                $(".modaal-gallery-item").find("[type='checkbox']").change(function() {
                    var $obj = $(this);
                    var src = $obj.attr("data-src-secondary");
                    var $originalCheckbox = $("[data-src='"+src+"']");
                    $originalCheckbox.prop("checked",$obj.prop("checked"));
                    $originalCheckbox.trigger("change");
                });
           },
           before_image_change: function(current_item,incoming_item) {
                console.log(current_item);
                console.log(incoming_item);
           }
       });

    $(".anterior-btn").unbind("click");
    $(".anterior-btn").click(function() {
        $(".loader").show();
        $(".entrantes .contenedor-tweets").empty();
        pageEntrantes = pageEntrantes-1>=0?pageEntrantes-1:0;
        loadTweets();
    });

    $(".siguiente-btn").unbind("click");
    $(".siguiente-btn").click(function() {
        $(".loader").show();
        $(".entrantes .contenedor-tweets").empty();
        pageEntrantes = pageEntrantes+1;
        loadTweets();
    });

    $(".search-mention button").unbind("click");
    $(".search-mention button").click(function() {
        $(".loader").show();
        var searchString = encodeURIComponent($(".search-mention input").val());
        $(".entrantes .contenedor-tweets").empty();
        if(searchString.length==0) {
            //RESET
            loadTweets();
        } else {
            $.get('/rrss/'+topic+'/get/mention/'+searchString,{},function(data) {
                var i=0;
                data.forEach(function(tweet) {
                    if($(".entrantes .contenedor-tweets").find("[data-tweet-id='"+tweet._id+"']").length==0) {
                        var $tweet = $(`<div class="columna tweet-entrante" data-tweet-id="`+tweet._id+`">
                                        <div class="tweet">
                                            <div class="fila contenido-tweet">
                                                <div class="fila datos-usuario">
                                                    <div class="columna foto">
                                                        <div class="foto-usuario-twitter" style="background: url(`+tweet.author.profile_pic+`) no-repeat center center; background-size: cover;">
                                                    </div>
                                                    </div>
                                                    <div class="columna fecha-ubicacion">
                                                        <div class="nombre-usuario">
                                                            <h3>`+tweet.author.name+`</h3>
                                                        </div>
                                                        <div class="fecha">
                                                            <p><i class="icono-calendario"></i> `+tweet.captured_at+`</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="columna usuario-comentario">
                                                    <div class="comentario">
                                                        <p>`+tweet.title+`</p>
                                                    </div>
                                                </div>
                                                <div class="columna media-entrantes">
                                                    <!-- contenido dinamico -->
                                                </div>
                                            </div>
                                            
                                            <div class="botones">
                                                <form>
                                                    <div class="boton-eliminar-tweet"><input type="checkbox" name="eliminar-tweet" /> Eliminar
                                                    </div>
                                                    <div class="boton-aprobar-tweet"><a class="aprobar-tweet" href="#"><i class="icono-aprobado"></i> Aprobar</a></div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>`);
                        $tweet.find(".media-entrantes").hide();
                        if(tweet.hasOwnProperty("extended_entities")) {
                            if(tweet.extended_entities.hasOwnProperty("media")) {
                                //Tiene media. Debemos verificar si es 1 o varios
                                if(tweet.extended_entities.media.length==1) {
                                    $tweet.find(".media-entrantes").show();
                                    tweet.extended_entities.media.forEach(function(media) {
                                       if(media.type=="photo") {
                                            console.log("photo");
                                            $photo = $(`<!-- Archivo 1 -->
                                                    <div class="contenedor-media">
                                                        <div class="media-tweet">
                                                            <a rel="`+tweet._id+`" href="`+tweet.extended_entities.media[0].media_url+`" alt="Foto de Usuario" class="media-image">
                                                                <img src="`+tweet.extended_entities.media[0].media_url+`">
                                                            </a>
                                                        </div>
                                                        <label><input type="checkbox" value="" data-parent-id="`+tweet._id+`" data-src="`+tweet.extended_entities.media[0].media_url+`">Mostrar</label>
                                                    </div>`);
                                            $tweet.find(".media-entrantes").append($photo);
                                       } 
                                       if(media.type=="video") {
                                            console.log("video");
                                       }
                                       if(media.type=="animated_gif") {
                                            console.log("animated_gif");
                                        }
                                    });
                                } else {
                                    //Tiene varios medios
                                    $tweet.find(".media-entrantes").show();
                                    if(tweet.extended_entities.media[0].type=='photo') {
                                        console.log("multi photo");
                                    } else {
                                        console.log("type not supported");
                                    }
                                }
                            }
                        }
                        $(".entrantes .contenedor-tweets").append($tweet);
                        i++;
                    }
                });
                initRRSSEvents();
                $(".loader").fadeOut(250);
            });
        }
    });
}

function deleteRecursive(idsToDelete,index,callback) {
    if(index<idsToDelete.length) {
        $.ajax({
            type: 'PUT',
            url: 'https://api.social-hound.com/'+idsToDelete[index]+'/selected/false',
            contentType: 'application/json',
            data: JSON.stringify({}), // access in body
        }).done(function () {
            $(".tweet-entrante[data-tweet-id='"+idsToDelete[index]+"']").slideUp(255,function() {
                $(this).remove();
                deleteRecursive(idsToDelete,index+1,function() {
                    callback();
                });
            });
        });
    } else {
        callback();
    }
}