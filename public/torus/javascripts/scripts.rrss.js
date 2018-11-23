var pageEntrantes = 0;
var refreshInbox = null;
$(function() {
    $(".entrantes .panel-opciones").slideUp(250);
    console.log("empty");
    $(".aprobados .mentions").empty();
    $(".entrantes .mentions").empty();
    loadTweets();
});

function loadTweets() {
    clearInterval(refreshInbox);
    loadTweetsOnDemand();
    refreshInbox = setInterval(loadTweetsOnDemand,10000);
}

function loadTweetsOnDemand() {
    if(pageEntrantes==0) {
        $(".anterior-btn").prop("disabled",true).addClass("disabled");
    } else {
        $(".anterior-btn").prop("disabled",false).removeClass("disabled");
    }
        $.get('/rrss/'+topic+'/get/selected',{},function(data) {
            console.log(data);
            data.forEach(function(tweet) {
                if($(".aprobados .mentions").find("[data-tweet-id='"+tweet._id+"']").length==0) {
                    $tweet = $(`
                        <div class="mention" data-tweet-id="`+tweet._id+`">
                            <div class="col left">
                                <div class="profile-pic" style="background-image:url(`+tweet.user.profile_image_url+`);">
                                    &nbsp;
                                </div>
                            </div>
                            <div class="col right">
                                <img class="social-network" src="/torus/images/twitter_logo.png">
                                <h2 class="fullname">`+tweet.user.name+`</h2>
                                <h3>@<text class="username">`+tweet.user.screen_name+`</text></h3>
                                <h5 class="date">`+tweet.created_at+`</h5>
                                <p class="message">`+tweet.text+`</p>
                            </div>
                            <div class="options">
                                <a class="btn delete eliminar-tweet">Eliminar</a>
                                <a class="btn approve boton-aprobar-tweet">Aprobar</a>
                            </div>
                        </div>
                        `);
                    $(".aprobados .mentions").append($tweet);
                }
            });
        });
        
        loadInbox();
}

function loadInbox() {
    $.get('/rrss/'+topic+'/get/inbox/'+pageEntrantes+'/20',{},function(data) {
        console.log(data);
        var i=0;
        data.forEach(function(tweet) {
            if($(".entrantes .mentions").find("[data-tweet-id='"+tweet._id+"']").length==0) {
                console.log("IN");
                $tweet = $(`
                        <div class="mention" data-tweet-id="`+tweet._id+`">
                            <div class="col left">
                                <div class="profile-pic" style="background-image:url(`+tweet.user.profile_image_url+`);">
                                    &nbsp;
                                </div>
                            </div>
                            <div class="col right">
                                <img class="social-network" src="/torus/images/twitter_logo.png">
                                <h2 class="fullname">`+tweet.user.name+`</h2>
                                <h3>@<text class="username">`+tweet.user.screen_name+`</text></h3>
                                <h5 class="date">`+tweet.created_at+`</h5>
                                <p class="message">`+tweet.text+`</p>
                            </div>
                            <div class="options">
                                <a class="btn delete eliminar-tweet">Eliminar</a>
                                <a class="btn approve boton-aprobar-tweet">Aprobar</a>
                            </div>
                        </div>
                        `);
                $(".entrantes .mentions").append($tweet);
                i++;
            }
        });
        initRRSSEvents();
        $(".loader").fadeOut(250);
    });
}

function initRRSSEvents() {
    $(".mentions").sortable({
        connectWith: ".mentions",
        receive: function( event, ui ) {
            var $newlist = $(event.target.parentElement);
            var $target = $(ui.item);
            var tweetid = $target.attr("data-tweet-id");
            var index = $target.index();
            if($newlist.hasClass("aprobados")) {
                $.post('/rrss/'+topic+'/post/update/'+tweetid+'/selected/true',{},function(data) {
                    updateOrderSelected().then(function() {
                        socket.emit('newtweet',{type:'newtweet',topic:topic});
                        loadTweetsOnDemand();
                    });
                });
            }
            if($newlist.hasClass("entrantes")) {
                $.post('/rrss/'+topic+'/post/update/'+tweetid+'/selected/false',{},function(data) {
                    updateOrderSelected().then(function() {
                        socket.emit('newtweet',{type:'newtweet',topic:topic});
                        loadTweetsOnDemand();
                    });
                });
            }
        },
        update: function( event, ui ) {
            var $newlist = $(event.target.parentElement);
            var $target = $(ui.item);
            var tweetid = $target.attr("data-tweet-id");
            var index = $target.index();
            if($newlist.hasClass("aprobados")&&ui.sender==null) {
                updateOrderSelected().then(function() {
                    socket.emit('newtweet',{type:'newtweet',topic:topic});
                    loadTweetsOnDemand();
                });
            }
        }
    });

    /*
    $(".contenedor-media [type='checkbox']").unbind("change");
    $(".contenedor-media [type='checkbox']").change(function() {
    	var $checkbox = $(this);
        var checked = $checkbox.prop("checked");
        var target = encodeURIComponent($checkbox.attr("data-src"));
        var tweet = $checkbox.attr("data-parent-id");
        $.post('/rrss/post/update-media/'+tweet+'/'+target+'/'+checked, function(data) {
            console.log(data);
            if($checkbox.parents(".media-aprobados").length>0) {
	            socket.emit('updatetweet',{tweet:tweet,target:target,checked:checked});
	        }
        });
    });
    */

    $("[name='eliminar-tweet']").unbind("change");
    $("[name='eliminar-tweet']").change(function() {
        var len = $("[name='eliminar-tweet']:checked").length;
        if(len>0) {
            $(".entrantes .panel-opciones").slideDown(250);
        } else {
            $(".entrantes .panel-opciones").slideUp(250);
        }
    });

    $(".btn-delete-all").closest("a").unbind("click");
    $(".btn-delete-all").closest("a").click(function() {
        var $tweetsToDelete = $(".aprobados .mention");
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

    $(".mention .eliminar-tweet").unbind("click");
    $(".mention .eliminar-tweet").bind("click",function() {
        var idToDelete = $(this).closest(".mention").attr("data-tweet-id");
        var r = confirm("Seguro que desea eliminar el Tweet?");
        if (r == true) {
            $.post('/rrss/'+topic+'/post/update/'+idToDelete+'/hidden/true',{},function(data) {
                $(".mention[data-tweet-id='"+idToDelete+"']").slideUp(255,function() {
                    socket.emit('deletetweet',{type:'newtweet',topic:topic});
                    $(this).remove();
                    updateOrderSelected().then(function() {
                        socket.emit('newtweet',{type:'newtweet',topic:topic});
                        loadTweetsOnDemand();
                    });
                });
            });
        } else {
            //cancel
        }
    });

    $(".boton-aprobar-tweet").unbind("click");
    $(".boton-aprobar-tweet").click(function() {
        var $obj = $(this);
        var idToApprove = $obj.closest(".mention").attr("data-tweet-id");
        $.post('/rrss/'+topic+'/post/update/'+idToApprove+'/selected/true',{},function(data) {
            console.log(data);
            $obj.closest(".mention").slideUp(255,function() {
                //TO-DO: agregar a lista de aprobados
                updateOrderSelected().then(function() {
                    socket.emit('newtweet',{type:'newtweet',topic:topic});
                    loadTweetsOnDemand();
                });
            });
        });
    });

    $(".switch-input").unbind("change");
    $(".switch-input").change(function() {
        var isChecked = $(this).is(":checked");
        socket.emit('toggletwitter',{show:isChecked,topic:topic});
    });

    $(".anterior-btn").unbind("click");
    $(".anterior-btn").click(function() {
        $(".loader").show();
        $(".entrantes .mentions").empty();
        pageEntrantes = pageEntrantes-1>=0?pageEntrantes-1:0;
        loadTweetsOnDemand();
    });

    $(".siguiente-btn").unbind("click");
    $(".siguiente-btn").click(function() {
        $(".loader").show();
        $(".entrantes .mentions").empty();
        pageEntrantes = pageEntrantes+1;
        loadTweetsOnDemand();
    });

    $(".btn-search").unbind("click");
    $(".btn-search").click(function() {
        clearInterval(refreshInbox);
        //refreshInbox = null;
        
        $(".loader").show();
        var searchString = encodeURIComponent($("[name='search']").val());
        $(".entrantes .mentions").empty();
        if(searchString.length==0) {
            //RESET
            loadTweetsOnDemand();
        } else {
            console.log('/rrss/'+topic+'/get/mention/'+searchString);
            $.get('/rrss/'+topic+'/get/mention/'+searchString,{},function(data) {
                var i=0;
                data.forEach(function(tweet) {
                    if(!tweet.hidden&&!tweet.selected) {
                        if($(".entrantes .mentions").find("[data-tweet-id='"+tweet._id+"']").length==0) {
                            $tweet = $(`
                            <div class="mention" data-tweet-id="`+tweet._id+`">
                                <div class="col left">
                                    <div class="profile-pic" style="background-image:url(`+tweet.user.profile_image_url+`);">
                                        &nbsp;
                                    </div>
                                </div>
                                <div class="col right">
                                    <img class="social-network" src="/torus/images/twitter_logo.png">
                                    <h2 class="fullname">`+tweet.user.name+`</h2>
                                    <h3>@<text class="username">`+tweet.user.screen_name+`</text></h3>
                                    <h5 class="date">`+tweet.created_at+`</h5>
                                    <p class="message">`+tweet.text+`</p>
                                </div>
                                <div class="options">
                                    <a class="btn delete eliminar-tweet">Eliminar</a>
                                    <a class="btn approve boton-aprobar-tweet">Aprobar</a>
                                </div>
                            </div>
                            `);
                            $(".entrantes .mentions").append($tweet);
                            i++;
                        }
                    }
                });
                initRRSSEvents();
                $(".loader").fadeOut(250);
            });
        }
    });
}

function updateOrderSelected() {
  return new Promise(() => {
    $(".aprobados .mentions .mention").each(function(index,elm) {
        var tweetid = $(elm).attr("data-tweet-id");
        $.post('/rrss/'+topic+'/post/update/'+tweetid+'/order/'+index,{},function(data) {
            //actualizado
            console.log(index);
        });
    });
  });
}

function deleteRecursive(idsToDelete,index,callback) {
    if(index<idsToDelete.length) {
        $.post('/rrss/'+topic+'/post/update/'+idsToDelete[index]+'/hidden/true',{},function(data) {
            $(".mention[data-tweet-id='"+idsToDelete[index]+"']").slideUp(255,function() {
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