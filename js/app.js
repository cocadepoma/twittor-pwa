const url = window.location.href;
const API_URL = `${ window.location.origin }/api/`;
const swLocation = '/twittor-pwa/sw.js';

if ( navigator.serviceWorker ) {
    if ( url.includes('localhost') ) {
        navigator.serviceWorker.register('/sw.js');
    } else {
        navigator.serviceWorker.register(swLocation);
    }
}


// Referencias de jQuery
var titulo      = $('#titulo');
var nuevoBtn    = $('#nuevo-btn');
var salirBtn    = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn     = $('#post-btn');
var avatarSel   = $('#seleccion');
var timeline    = $('#timeline');

var modal       = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns  = $('.seleccion-avatar');
var txtMensaje  = $('#txtMensaje');

// El usuario, contiene el ID del héroe seleccionado
var usuario;




// ===== Codigo de la aplicación

function crearMensajeHTML(mensaje, personaje) {

    var content =`
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${ personaje }.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${ personaje }</h3>
                <br/>
                ${ mensaje }
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    cancelarBtn.click();

}



// Globals
function logIn( ingreso ) {

    if ( ingreso ) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.text('Seleccione Personaje');
    
    }

}


// Seleccion de personaje
avatarBtns.on('click', function() {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Boton de salir
salirBtn.on('click', function() {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function() {

    modal.removeClass('oculto');
    modal.animate({ 
        marginTop: '-=1000px',
        opacity: 1
    }, 200 );

});

// Boton de cancelar mensaje
cancelarBtn.on('click', function() {
    if ( !modal.hasClass('oculto') ) {
        modal.animate({ 
            marginTop: '+=1000px',
            opacity: 0
         }, 200, function() {
             modal.addClass('oculto');
             txtMensaje.val('');
         });
    }
});

// Boton de enviar mensaje
postBtn.on('click', function() {

    var message = txtMensaje.val();
    if ( message.length === 0 ) {
        cancelarBtn.click();
        return;
    }

    postMessage( message, usuario );
    crearMensajeHTML( message, usuario );
});


// Post messages to server
function postMessage(message, user) {
    
    fetch('api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, user })
    })
    .then( res => res.json() )
    .then( data => {
        console.log('Mensaje guardado', data);
    })
    .catch( err => {
        console.log('Error en envio', err);
    });
}

// Get messages from server
function getMessages() {
    fetch('api')
        .then( res => res.json() )
        .then( posts => {
            console.log(posts)
            posts.forEach( post => {
                crearMensajeHTML( post.message, post.user );
            });
        });
}

getMessages();

window.addEventListener('online',isOnline);
window.addEventListener('offline', isOnline);

function isOnline() {
    if (navigator.onLine) {
        $.mdtoast('Online', {
            interaction: true,
            interactionTimeout: 1000,
            actionText: 'Ok!',
            type: 'success'
        });
    } else {
        $.mdtoast('Offline', {
            interaction: true,
            actionText: 'Ok!',
            type: 'warning'
        });
    }
}