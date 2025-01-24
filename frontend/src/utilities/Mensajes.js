import swal from 'sweetalert';

// Mensaje con recarga de página
export const mensajes = (texto, type = 'success', title = 'OK') => {
  swal({
    title: title,
    text: texto,
    icon: type,
    button: 'OK',
    closeOnEsc: true
  }).then(() => {
    window.location.reload();
  });
};

// Mensaje sin recargar la página
export const mensajesSinRecargar = (texto, type = 'success', title = 'OK') => {
  swal({
    title: title,
    text: texto,
    icon: type,
    button: 'OK',
    closeOnEsc: true
  });
};
