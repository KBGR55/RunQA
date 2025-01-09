const URL_BACKEND = "http://localhost:3006/api"
export const URLBASE = "http://localhost:3006/"; 

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
        "x-api-token": key
    };
    const datos = await (await fetch(`${URL_BACKEND}/${URL}`, {
        method: "GET",
        headers: headers,
    })).json();
    console.log("datos", datos);
    
    return datos;
}

export const peticionPost = async (key, URL,data) => {
    const headers = {
        "Content-Type": "application/json",
        "x-api-token": key
    };
    const datos = await (await fetch(`${URL_BACKEND}/${URL}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
    })).json();
    return datos;
}
export const peticionPut = async (key, URL,data) => {
    const headers = {
        "Content-Type": "application/json",
        "x-api-token": key
    };
    const datos = await (await fetch(`${URL_BACKEND}/${URL}`, {
        method: "PUT",
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

    try {
        const response = await fetch(URL_BACKEND + urls, requestOptions);
        const contentType = response.headers.get("content-type");
        const textResponse = await response.text();
        
        if (contentType && contentType.includes("application/json")) {
            return JSON.parse(textResponse);
        } else {
            throw new Error("La respuesta del servidor no es JSON: " + textResponse);
        }
        

    } catch (error) {
        console.log("Error:", error);
        throw error;
    }
};



export const ActualizarImagenes = async (data, key, urls) => {
    console.log(data);
    const headers = {
        "x-api-token": key,
    };
    const requestOptions = {
        method: "PUT",
        headers: headers,
        body: data, 
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
export const peticionDelete = async (key, URL) => {
    const headers = {
        "Content-Type": "application/json",
        "x-api-token": key
    };
    const datos = await (await fetch(`${URL_BACKEND}/${URL}`, {
        method: "DELETE",
        headers: headers,
    })).json();
    return datos;
}

export const ObtenerPost = async (key, url, bodyData) => {
    const headers = {
        "Content-Type": "application/json",
        "X-API-TOKEN": key
    };

    try {
        const response = await fetch(`${URL}/${url}`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(bodyData)
        });

        const text = await response.text();
        let datos;

        try {
            datos = JSON.parse(text);
        } catch (error) {
            throw new Error(`La respuesta no es un JSON válido: ${text}`);
        }
        return datos;

    } catch (error) {
        console.error("Error al realizar la solicitud POST:", error);
        throw error;
    }
}