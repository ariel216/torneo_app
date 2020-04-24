'use strict';
var app = new Vue({
  el: '#app',
  data: {
    cargando : false,
    jugando : false,
    limite : 10,
    puntaje : 0,
    tiempo : 10,
    sorteadas: [],
    preguntas:[],
    pregunta:null,
    np:0
  },
  mounted () {},
  methods: {
    iniciar:function(){
      this.jugando = true;
      this.puntaje = 0;
      this.tiempo = 10;
      this.sorteadas = [];
      this.idrespuesta = null;
      this.cronometro = null;
      this.np=0;
      this.cargarPreguntas();
    },
    finalizar:function(){
      this.jugando = false;
      this.puntaje = 0;
      this.tiempo = 10;
      this.sorteadas = [];
      this.idrespuesta = null;
      this.cronometro = null;
      this.limite=10;
      this.np=0;
    },
    cargarPreguntas:function(){
      this.cargando = true;
      axios.get('assets/data/preguntas.json').then(response => {
        this.preguntas = response.data;
        this.generarSorteadas();
        this.pregunta = this.sorteaPregunta();
      }).catch(error => {
        console.log(error);
        this.errored = true;
      }).finally(() => {
        this.cargando = false;
      });
    },
    generarSorteadas: function (){
      this.preguntas = this.preguntas.sort(function(){
        return Math.random() - 0.5;
      });
      for (let i = 0; i < this.limite; i++) {
        this.sorteadas.push(this.preguntas[i]);
      };
    },
    sorteaPregunta: function () {
      this.np++;
      this.limite--;
      let nroPregunta = this.limite;
      if(this.limite<0){
        //se acabo la partida
        let ruta;
        let resultado;
        if(this.puntaje>60){
          ruta = '/assets/img/ovejas.gif';
          resultado= '¡Ganaste!';
        }else{
          ruta = '/assets/img/patan.gif';
          resultado= 'Perdiste...';
        }
        Swal.fire({
          allowOutsideClick:false,
          title: resultado,
          text: `Obtuviste ${this.puntaje} puntos.`,
          imageUrl: ruta,
          imageHeight: 190,
          icon: 'info',
          confirmButtonColor: '#52b39a',
          confirmButtonText: 'Finalizar'
        }).then((result) => {
          if (result.value) {
            this.finalizar();
          }
        });
      }
      //this.actualizarCronometro();
      return this.sorteadas[nroPregunta];
    },
    responderPregunta:function(){
      if(this.pregunta.correcta===this.idrespuesta){
        clearInterval(this.cronometro);
        this.sonidoCorrecto();
        Swal.fire({
          allowOutsideClick:false,
          title: 'Correcto',
          icon: 'success',
          confirmButtonColor: '#52b39a',
          confirmButtonText: 'Siguiente'
        }).then((result) => {
          if (result.value) {
            //carga nueva pregunta
            this.tiempo=10;
            this.puntaje+=10;
            this.idrespuesta = null;
            this.pregunta = this.sorteaPregunta();
          }
        });
      }else{
        clearInterval(this.cronometro);
        this.sonidoError();
        Swal.fire({
          allowOutsideClick:false,
          title: 'Incorrecto',
          icon: 'error',
          confirmButtonColor: '#52b39a',
          confirmButtonText: 'Siguiente'
        }).then((result) => {
          if (result.value) {
            this.tiempo=10;
            this.idrespuesta = null;
            this.pregunta = this.sorteaPregunta();
          }
        });
      }
    },
    elegirRespuesta: function(idrespuesta){
      this.idrespuesta = idrespuesta;
      this.responderPregunta();
    },
    restaCronometro: function (){
      this.tiempo--;
      if(this.tiempo<1){
        clearInterval(this.cronometro);
        this.sonidoError();
        Swal.fire({
          title: 'El tiempo terminó',
          icon: 'error',
          confirmButtonColor: '#52b39a',
          confirmButtonText: 'Siguiente'
        }).then((result) => {
          if (result.value) {
            //carga nueva pregunta
            this.tiempo=10;
            this.idrespuesta = null;
            this.pregunta = this.sorteaPregunta();
          }
        });
      }
    },
    actualizarCronometro:function(){
      //this.sonidoReloj();
      this.cronometro = setInterval(this.restaCronometro, 1000);
    },
    sonidoReloj:function(){
      let sonido = new Audio("/assets/sounds/reloj.mp3");
      sonido.play();
    },
    sonidoCorrecto:function () {
      let sonido = new Audio("/assets/sounds/correcto.mp3");
      sonido.play();
    },
    sonidoError:function () {
      let sonido = new Audio("/assets/sounds/error.mp3");
      sonido.play();
    }
  }

});
