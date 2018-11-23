$(function() {
	start();
	var timer = setInterval(start,450000);
});

var axisList = [];
var typeGlobal = 'ejes';
var axisGlobal = null;

function start() {
	console.log("start");
	if(typeGlobal=='ejes') $(".subaxis-controls").hide();
	loadData(typeGlobal,axisGlobal,function() {
		getAxisList();
		initEvents();
		socket.emit('reqaxislist', { });
	});
}

function loadData(type,target,callback) {
	switch(type) {
		case 'ejes':
			$.get('/total/ejes',{},function(result) {
				console.log(result);
				var typeOfCongestion = ['high'];
				for(var k=0; k<typeOfCongestion.length; k++) {
					var category = typeOfCongestion[k];
					var data = result[category];
					for(var i=0; i<data.length; i++) {
						if(!$(".traffic-col").find("[data-axis='"+data[i].axis+"']").length) {
							insertAxis(data[i].name,data[i].axis,false);
							var time = isNaN(parseInt(data[i].time))?data[i].time:data[i].time+' mins';
							var $btn = $(`<button type="button" class="btn col-md-4 col-xs-12" data-axis="`+data[i].axis+`" data-name="`+data[i].name+`">
	                                        <i class="fa fa-search fa-3x icon"></i>
	                                        <i class="fa fa-times fa-3x icon"></i>
	                                        <h4>`+data[i].axis+`</h4>
						                    <h3><i class="fa fa-clock-o"></i><span class="time">`+time+`</span></h3>
						                </button>`);
							//$(".traffic-col .traffic-col-"+category+" .traffic-col-body").append($btn);
							$(".traffic-col .traffic-col-high .traffic-col-body").append($btn);
						} else {
							//update
							var $btn = $(".traffic-col").find("[data-axis='"+data[i].axis+"']");
							var originalTime = $btn.find("span.time").text();
							if(originalTime!=data[i].time) {
								var time = isNaN(parseInt(data[i].time))?data[i].time:data[i].time+' mins';
								$btn.find("span.time").text(time);
							}
						}
					}
				}
				callback();
			});
			break;
		case 'subejes':
			$.get('/total/subejes/'+target,{},function(result) {
				var typeOfCongestion = ['high'];
				for(var k=0; k<typeOfCongestion.length; k++) {
					var category = typeOfCongestion[k];
					var data = result[category];
					for(var i=0; i<data.length; i++) {
						if(!$(".traffic-col").find("[data-axis='"+data[i].axis+"']").length) {
							insertAxis(data[i].name,data[i].axis,false);
							var time = isNaN(parseInt(data[i].time))?data[i].time:data[i].time+' mins';
							var $btn = $(`<button type="button" class="btn col-md-4 col-xs-12" data-axis="`+axisGlobal+`" data-name="`+data[i].axis+`">
	                                        <i class="fa fa-search fa-3x icon"></i>
	                                        <i class="fa fa-times fa-3x icon"></i>
	                                        <h4>`+data[i].axis+`</h4>
						                    <h3><i class="fa fa-clock-o"></i><span class="time">`+time+`</span></h3>
						                </button>`);
							//$(".traffic-col .traffic-col-"+category+" .traffic-col-body").append($btn);
							$(".traffic-col .traffic-col-high .traffic-col-body").append($btn);
						} else {
							//update
							var $btn = $(".traffic-col").find("[data-axis='"+data[i].axis+"']");
							var originalTime = $btn.find("span.time").text();
							if(originalTime!=data[i].time) {
								var time = isNaN(parseInt(data[i].time))?data[i].time:data[i].time+' mins';
								$btn.find("span.time").text(time);
							}
						}
					}
				}
				callback();
			});
			break;
	}
}

var longpress = 1000;
var longpresstimer = null;
var start;

function initEvents() {
	$(".traffic-col .traffic-col-body .btn").unbind("mousedown");
	$(".traffic-col .traffic-col-body .btn").on( 'mousedown', function( e ) {
		var $btn = $(this);
        start = new Date().getTime();
        longpresstimer = setTimeout(function() {
        	clearTimeout(longpresstimer);
        	axisName = $btn.find("h4").text().toUpperCase();
        	$("span.subaxis").text(axisName);
        	$(".subaxis-controls").fadeIn(500);
        	$(".traffic-col .traffic-col-body").empty();
        	typeGlobal = 'subejes';
        	axisGlobal = $btn.attr("data-name");
        	loadData('subejes',$btn.attr("data-name"),function() {
        		initEvents();
        		updateElements(axisList);
        	});
        },longpress);
    } );

	$(".traffic-col .traffic-col-body .btn").unbind("mouseleave");
    $(".traffic-col .traffic-col-body .btn").on( 'mouseleave', function( e ) {
        start = 0;
        clearTimeout(longpresstimer);
    } );

    $(".traffic-col .traffic-col-body .btn").unbind("mouseup");
    $(".traffic-col .traffic-col-body .btn").on( 'mouseup', function( e ) {
    	var $btn = $(this);
        if ( new Date().getTime() >= ( start + longpress )  ) {
           //nada  
        } else {   
           clearTimeout(longpresstimer);
           var color;
			if($btn.hasClass("active")) {
				//OFF
				updateAxis(typeGlobal=='ejes'?$btn.attr("data-name"):axisGlobal,$btn.attr("data-name"),typeGlobal=='ejes'?false:true,false,function(data) {
					var axisMessage = { axis: $btn.attr("data-name"), status: 'off' };
					console.log(axisMessage);
					socket.emit('axis', axisMessage);
					socket.emit('axislist', { axislist: axisList });
				});
			} else {
				//ON
				updateAxis(typeGlobal=='ejes'?$btn.attr("data-name"):axisGlobal,$btn.attr("data-name"),typeGlobal=='ejes'?false:true,true,function(data) {
					var axisMessage = { axis: $btn.attr("data-name"), status: 'on' };
					console.log(axisMessage);
					socket.emit('axis', axisMessage);
					socket.emit('axislist', { axislist: axisList });
				});
			}
			$(this).toggleClass("active");
	    }
    } );

	$(".btn-style").unbind("click");
	$(".btn-style").click(function() {
		$(".btn-style").removeClass("active");
		$(this).addClass("active");
		socket.emit('mapstyle', { style: $(this).attr("data-style") });
	});

	$(".btn-back").unbind("click");
	$(".btn-back").click(function() {
		$(".subaxis-controls").fadeOut(500);
		$(".traffic-col .traffic-col-body").empty();
		typeGlobal = 'ejes';
		loadData('ejes',null,function() {
			initEvents();
			updateElements(axisList);
		});
	});

	$(".traffic-col .traffic-col-body .btn").unbind('touchend');
	$(".traffic-col .traffic-col-body .btn").unbind('touchstart');
	$(".traffic-col .traffic-col-body .btn").on('touchend', function (e) {
	   start = 0;
       clearTimeout(longpresstimer);
	}).on('touchstart', function (e) {
	   var $btn = $(this);
       start = new Date().getTime();
       longpresstimer = setTimeout(function() {
       	clearTimeout(longpresstimer);
       	$(".subaxis-controls").fadeIn(500);
       	$(".traffic-col .traffic-col-body").empty();
       	loadData('subejes',$btn.attr("data-name"),function() {
       		initEvents();
       	});
       },longpress);
	});

	$(".restart").unbind("click");
	$(".restart").click(function() {
		socket.emit('restart',{});
	});
}

function insertAxis(name,axis,isSubaxis) {
	var response = searchAxis(name,axis,isSubaxis);
	if(response.name==-1) axisList.push({ name: name, axis: axis, active: false, subaxis: [] });
	if(isSubaxis&&response.axis==-1) axisList[response.name].subaxis.push({ name: name, axis: axis, active: false });
}

function updateAxis(name,axis,isSubaxis,active,callback) {
	var response = searchAxis(name,axis,isSubaxis);
	console.log(response);
	if(!isSubaxis&&response.name!=-1) axisList[response.name].active = active;
	if(isSubaxis&&response.axis!=-1) axisList[response.name].subaxis[response.axis].active = active;
	callback(axisList);
}

function searchAxis(name,axis,isSubaxis) {
	for(var i=0;i<axisList.length;i++) {
		if(axisList[i].name==name) {
			if(isSubaxis) {
				if(axisList[i].subaxis.length) {
					for(var j=0;j<axisList[i].subaxis.length;j++) {
						if(axisList[i].subaxis[j].axis==axis) {
							return {name:i,axis:j};
						}
					}
					return {name:i,axis:-1};
				} else {
					return {name:i,axis:-1};
				}
			} else {
				return {name:i,axis:-1};
			}				
		}
	}
	return {name:-1,axis:-1};
}

function updateElements(list) {
	console.log(list);
	if(typeGlobal=='subejes') {
		for(var i=0;i<list.length;i++) {
			if(list[i].name==axisGlobal) {
				for(var j=0;j<list[i].subaxis.length;j++) {
					var $btn = $(".traffic-col .traffic-col-body").find("[data-name='"+list[i].subaxis[j].name+"']");
					if(!list[i].active) {
						$btn.removeClass("active");
					} else {
						$btn.addClass("active");
					}
				}
			}
		}
	} else {
		for(var i=0;i<list.length;i++) {
			var $btn = $(".traffic-col .traffic-col-body").find("[data-name='"+list[i].name+"']");
			if(!list[i].active) {
				$btn.removeClass("active");
			} else {
				$btn.addClass("active");
			}
		}
	}
}

function getAxisList() {
	console.log(axisList);
}

socket.on('axislist', function(msg){
  axisList = msg.axislist;
  if(axisList) updateElements(axisList);
});
socket.on('loadaxislist', function(msg){
	if(msg.axislist==undefined) {
		socket.emit('saveaxislist',{axislist:axisList});
	} else {
		axisList = msg.axislist;
		updateElements(axisList)
	}
});
socket.on('restart', function(msg) {
    location.reload();
});