settings = {
    //Model Popup
    objModalPopupBtn: ".nuevo_evento, .editar-evento",
    objModalCloseBtn: ".overlay, .cerrar_modal, .salir",
    objModalDataAttr: "data-popup"
}  

if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}

function startEvents() {
    $(settings.objModalPopupBtn).unbind("click");
    $(settings.objModalPopupBtn).bind("click", function () {
      if ($(this).attr(settings.objModalDataAttr)) {

          var strDataPopupName = $(this).attr(settings.objModalDataAttr);
          var linea = $(this).closest(".columna").attr("data-id");
          $(".overlay, #" + strDataPopupName).find("input#l"+linea.toLowerCase()).click();
          //Fade In Modal Pop Up
          $(".overlay, #" + strDataPopupName).fadeIn(170);
      }
    });

    $("input[type='radio'][name='lineas']").unbind("change");
    $("input[type='radio'][name='lineas']").change(function(){
      var lineaArr = $(this).val().split("-");
      var linea = lineaArr[1];
      loadEstaciones(linea,function() {
        //loader off
        $(".loader").fadeOut(250);
      });
    });

    //On clicking the modal background
    $(settings.objModalCloseBtn).unbind("click");
    $(settings.objModalCloseBtn).bind("click", function () {
      $(".modal").fadeOut(150);
    });

    $("#info-adicional").unbind("keypress keydown");
    $("#info-adicional").bind("keypress keydown",function(e) {
        var KeyID = e.keyCode;
        var len = $("#info-adicional").val().length;
         switch(KeyID)
         {
            case 8:
              break; 
            case 46:
              break;
            default:
              if(len<parseInt(window.limit)) {
                //nothing
              } else {
                e.preventDefault();
                return false;
              }
         }
    });

    $("#info-adicional").unbind("keyup");
    $("#info-adicional").bind("keyup",function(e) {
        var len = $("#info-adicional").val().length;
        $("text.current").text(len);
    });

    $(".evento .eliminar-evento").unbind("click");
    $(".evento .eliminar-evento").click(function() {
      var $obj = $(this);
      var $container = $obj.closest(".contenedor-eventos");
      var id = $obj.closest(".evento").attr("data-id");
      var linea = $obj.closest(".evento").attr("data-linea");
      var estacionid = $obj.closest(".evento").attr("data-estacionid");
      $.post('/metro/post/evento', { evento:JSON.stringify({_id:id,delete:true}) },function(data) {
        if(data.deleted) {
          socket.emit("deletedevent",{_id:id,linea:linea,estacion:estacionid});
        }
      });
    });

    $(".modal .guardar").unbind("click");
    $(".modal .guardar").click(function() {
      var lineaArr = $('input[name="lineas"]:checked').val().split("-");
      var linea = lineaArr[1];
      var reporte = {
        linea: linea,
        estacion: $("#estaciones-metro option[value='"+$("#estaciones-metro").val()+"']").text(),
        estacionid: $("#estaciones-metro option[value='"+$("#estaciones-metro").val()+"']").attr("data-estacionid"),
        lat: $("#estaciones-metro option[value='"+$("#estaciones-metro").val()+"']").attr("data-lat"),
        lng: $("#estaciones-metro option[value='"+$("#estaciones-metro").val()+"']").attr("data-lng"),
        evento: $('input[name="evento"]:checked').val(),
        timestamp: new Date(),
        horasRetraso: $("input[name='hora']").val(),
        minutosRetraso: $("input[name='minutos']").val(),
        infoAdicional: $("#info-adicional").val()
      }
      $.post('/metro/post/evento', { evento:JSON.stringify(reporte) },function(data) {
          console.log(data);
          socket.emit('newevent', reporte);
      });
    });
}

socket.on('deletedevent',function(msg) {
  var $container = $(".evento[data-id='"+msg._id+"']").closest(".contenedor-eventos");
  $(".evento[data-id='"+msg._id+"']").slideUp(250,function() {
    $(".evento[data-id='"+msg._id+"']").remove();
    if($container.find(".evento").length==0) {
      $container.removeClass("activo");
      $container.find(".agregar-evento-mas").addClass("agregar-evento").removeClass("agregar-evento-mas");
    }
    if($container.find(".evento").length<3) {
      $container.find(".agregar-evento-mas").show();
    }
  });
});

socket.on('newevent',function(msg) {
  var linea = msg.linea;
  $.get('/metro/get/evento/'+linea,{},function(data){
      if(data.length>0) {
        $("[data-id='"+linea+"'] .contenedor-eventos").addClass("activo");
        $("[data-id='"+linea+"'] .contenedor-eventos .agregar-evento").addClass("agregar-evento-mas").removeClass("agregar-evento");
        data.forEach(function(evento) {
          console.log(evento);
          if(!$("[data-id='"+linea+"'] .contenedor-eventos .evento[data-id='"+evento._id+"']").length) {
            var $eventoContainer = $(`<!-- Evento activado -->   
                              <div class="evento" data-id="`+evento._id+`" data-linea="`+evento.linea+`" data-estacion="`+evento.estacion+`" data-estacionid="`+evento.estacionid+`" data-evento="`+evento.evento+`" data-timestamp="`+evento.timestamp+`" data-horas="`+evento.horasRetraso+`" data-minutos="`+evento.minutosRetraso+`" data-infoadicional="`+evento.infoAdicional+`">
                                  <div>
                                      <h3>`+evento.estacion+`</h3>
                                  </div>
                                  <div class="botones">
                                      <a class="editar-evento" href="#" data-popup="popup"><i class="icono-editar"></i> Editar</a>
                                      <a class="eliminar-evento" href="#"><i class="icono-cerrar"></i></a>
                                  </div>
                              </div>`);
            $("[data-id='"+linea+"'] .contenedor-eventos").prepend($eventoContainer);
            if($("[data-id='"+linea+"'] .contenedor-eventos .evento").length==3) {
              $("[data-id='"+linea+"'] .contenedor-eventos .agregar-evento-mas").hide();
            }
          }
        });
        $(".modal").fadeOut(150);
        startEvents();
      } 
  });
});

function loadEstaciones(linea,callback) {
  $.get("/metro/get/estaciones/"+linea,{},function(data) {
    $(".modal").find("select#estaciones-metro").empty();
    data.forEach(function(estacion) {
        $(".modal").find("select#estaciones-metro").append(`<option value="`+estacion.acronym+`" data-estacionid="`+estacion._id+`" data-lat="`+estacion.lat+`" data-lng="`+estacion.lng+`">`+estacion.name+`</option>`);
    });
    callback();
  });
}