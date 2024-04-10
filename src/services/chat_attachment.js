export const sendMessage = async (jobId, data) => {
    const authToken = localStorage.getItem('authToken');
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${authToken}`, 
        },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/jobs/${jobId}/messages`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        if(response.status === 201){
            return { res: data, error: null } ;
        }else{
            return { res: null, error: data } ;
        }
    } catch (error) {
        console.error("There was an error!", error);
        return { res: null, error: error }
    }
};


export const getMessages = async (jobId) => {
    const authToken = localStorage.getItem('authToken');
    const requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${authToken}`, 
        },
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/jobs/${jobId}/messages`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        if(response.status === 200){
            return { res: data.messages, error: null } ;
        }else{
            return { res: null, error: data } ;
        }
    } catch (error) {
        console.error("There was an error!", error);
        return { res: null, error: error }
    }
};


export const getAttachments = async (jobId) => {
    const authToken = localStorage.getItem('authToken');
    const requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${authToken}`, 
        },
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/jobs/${jobId}/attachments`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        if(response.status === 200){
            return { res: data, error: null } ;
        }else{
            return { res: null, error: data } ;
        }
    } catch (error) {
        console.error("There was an error!", error);
        return { res: null, error: error }
    }
};

export const addAttachments = async (formData, jobId) => {
    const authToken = localStorage.getItem('authToken');
    const requestOptions = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authToken}`, 
        },
        body: formData
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/jobs/${jobId}/attachments`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());

        if(response.status === 200){
            return { res: data, error: null } ;
        }else{
            return { res: null, error: data } ;
        }
    } catch (error) {
        console.error("There was an error!", error);
        return { res: null, error: error }
    }
};

export const deleteAttachments = async (attachmentId) => {
    const authToken = localStorage.getItem('authToken');
    const requestOptions = {
        method: "DELETE",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${authToken}`, 
        },
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/attachments/${attachmentId}`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        if(response.status === 200){
            return { res: data, error: null } ;
        }else{
            return { res: null, error: data } ;
        }
    } catch (error) {
        console.error("There was an error!", error);
        return { res: null, error: error }
    }
};