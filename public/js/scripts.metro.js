$(function() {
	getData(function() {
		startEvents();
		$(".loader").fadeOut(255);
	})
});

function getData(callback) {
	var lineas;
	$.get('/metro/get/lineas',{},function(data) {
		lineas = data;
		getDataRecursive(lineas,0,function() {
			callback();
		});
	});
}

function getDataRecursive(lineas,index,callback) {
	if(index<lineas.length) {
		var linea = lineas[index];
		var $container = $(`<div class="columna">
						        <div class="titulo-linea">
						            <h2><i class="icono-metro"></i> `+linea.name+`</h2>
						        </div>
						        <div class="contenedor-eventos">
						            <!-- Sin Eventos + Boton Agregar evento -->
						                <div class="agregar-evento">
						                    <a href="#" class="nuevo_evento" data-popup="popup"><i class="icono-mas"></i><p>Agregar evento</p></a>

						                </div>
						            <!-- Fin Sin Eventos + Boton Agregar evento -->
						        </div>
						    </div>`);

		var $linearadio = $(`<label for="Línea `+linea.id+`" class="iconos-lineas">
	                            <input type="radio" name="lineas" id="l`+linea.id.toLowerCase()+`" value="linea-`+linea.id+`"/>
	                            <span><i class="icono-metro"></i>L`+linea.id+`</span>
	                        </label>`);
		var classToAdd = "linea"+linea.id;
		$container.addClass(classToAdd);
		$container.attr("data-id",linea.id);
		$linearadio.attr("data-id",linea.id);
		$("section.lineas-metro .fila.lineas").append($container);
		$("section.modal .opciones-lineas").append($linearadio);
		$.get('/metro/get/evento/'+linea.id,{},function(data){
			if(data.length>0) {
				$("[data-id='"+linea.id+"'] .contenedor-eventos").addClass("activo");
				$("[data-id='"+linea.id+"'] .contenedor-eventos .agregar-evento").addClass("agregar-evento-mas").removeClass("agregar-evento");
				data.forEach(function(evento) {
					console.log(evento);
					var $eventoContainer = $(`<!-- Evento activado -->   
		                        <div class="evento" data-id="`+evento._id+`" data-linea="`+evento.linea+`" data-estacion="`+evento.estacion+`" data-evento="`+evento.evento+`" data-timestamp="`+evento.timestamp+`" data-horas="`+evento.horasRetraso+`" data-minutos="`+evento.minutosRetraso+`" data-infoadicional="`+evento.infoAdicional+`">
		                            <div>
		                                <h3>`+evento.estacion+`</h3>
		                            </div>
		                            <div class="botones">
		                                <a class="editar-evento" href="#" data-popup="popup"><i class="icono-editar"></i> Editar</a>
		                                <a class="eliminar-evento" href="#"><i class="icono-cerrar"></i></a>
		                            </div>
		                        </div>`);
					$("[data-id='"+linea.id+"'] .contenedor-eventos").prepend($eventoContainer);
				});
			} 
			
			getDataRecursive(lineas,index+1,function() {
				callback();
			});
		});
	} else {
		callback();
	}
}