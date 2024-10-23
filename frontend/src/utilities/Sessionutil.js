//------------------TOKEN DE SESION------------------
export const saveToken = (token) => {
    localStorage.setItem("token", token);
}
 
export const getToken = () => {
    return localStorage.getItem('token');
}

export const borrarSesion=()=>{
    localStorage.clear();
}

export const estaSesion = () => {
    var token = localStorage.getItem('token');
    return (token && (token !== 'undefined' && token !== null && token !== 'null'));
};

//------------------USUARIO------------------
export const saveUser = (user) => {
    const userJSON = JSON.stringify(user);
    localStorage.setItem('user', userJSON);
}

export const getUser = () => {
    const userJSON = localStorage.getItem('user');
    return JSON.parse(userJSON);
}

export const saveExternalProyecto= (external_id) => {
    const externalProyecto = JSON.stringify(external_id);
    localStorage.setItem('external_id', externalProyecto);
}

export const getExternalProyecto = () => {
    const externalProyecto = localStorage.getItem('external_id');
    return JSON.parse(externalProyecto);
}

export const savetokenApi = (tokenapi) => {
    localStorage.setItem("tokenapi", tokenapi);
}
export const gettokenApi = () => {
    return localStorage.getItem('tokenapi');
}
//------------------Correo------------------
export const saveCorreo = (correo) => {
    localStorage.setItem('correo', correo);
}

export const getCorreo = () => {
    return localStorage.getItem('correo');
    
}
//------------------DARK MODE------------------
export const saveDarkMode = (isDark) => {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
}

export const getDarkMode = () => {
    const darkMode = localStorage.getItem('darkMode');
    return darkMode ? JSON.parse(darkMode) : false; // default to false if not set
}
