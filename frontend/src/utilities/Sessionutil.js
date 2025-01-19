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
//------------------ROLES------------------
export const saveRoles = (roles) => {
    const rolesJSON = JSON.stringify(roles);
    localStorage.setItem('roles', rolesJSON);
};

export const getRoles = () => {
    const rolesJSON = localStorage.getItem('roles');
    return rolesJSON ? JSON.parse(rolesJSON) : null;
};

export const borrarRoles = () => {
    localStorage.removeItem('roles');
};
