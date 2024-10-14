const URL_BACKEND = "http://localhost:3006/api"
export const URLBASE = "http://localhost:3006"; 
export const loginpost = async (formData, URL) => {
    const headers = {
        "Accept": 'application/json',
    };

    const response = await fetch(`${URL_BACKEND}/${URL}`, {
        method: "POST",
        headers: headers,
        body: formData
    });

    try {
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            const datos = await response.json();
            return datos;
        } else {
            const text = await response.text();
            throw new Error(`Unexpected content type: ${text}`);
        }
    } catch (error) {
        console.error('Error al procesar la respuesta:', error);
        return { msg: 'Error al procesar la respuesta', code: 500 };
    }
}

export const InicioSesion = async (data) => {
    const headers = {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
    };
    const datos = await (await fetch(URL_BACKEND + "/sesion", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data)
        
    })).json();
    return datos;
}


export const peticionGet = async (key, URL) => {
    const headers = {
        "Content-Type": "application/json",
        "X-API-TOKEN": key
    };
    const datos = await (await fetch(`${URL_BACKEND}/${URL}`, {
        method: "GET",
        headers: headers,
    })).json();
    return datos;
}
export const peticionPost = async (key, URL,data) => {
    const headers = {
        "Content-Type": "application/json",
        "X-API-TOKEN": key
    };
    const datos = await (await fetch(`${URL_BACKEND}/${URL}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
    })).json();
    return datos;
}

export const GuardarImages = async (data, key, urls) => {
    const headers = {
        "x-api-token": key,
    };
    const requestOptions = {
        method: "POST",
        headers: headers,
        body: data, 
    };
    console.log("DATITA", data);
    
    try {
        const response = await fetch(URL + urls, requestOptions);

        const datos = await response.json();

        return datos;
    } catch (error) {
        console.log("Error:", error);
        throw error;
    }  
    
}

export const ActualizarImagenes = async (data, key, urls) => {
    console.log('llega');
    console.log(data);
    const headers = {
        "x-api-token": key,
    };
    const requestOptions = {
        method: "PUT",
        headers: headers,
        body: data, // Envía el FormData directamente como cuerpo
    };
    try {
        const response = await fetch(URL_BACKEND + urls, requestOptions);

        const datos = await response.json();

        return datos;
    } catch (error) {
        console.log("Error:", error);
        throw error;
    }
}