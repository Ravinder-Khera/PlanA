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
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/v2/jobs/${jobId}/messages`, requestOptions);
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

export const sendComment = async (data) => {
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
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/v2/comments`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log("zxczxczxczxc", data);  
        if(response.status === 201 || response.status === 200){
            return { res: data.comment, error: null } ;
        }else{
            return { res: null, error: data } ; 
        }
    } catch (error) {
        console.error("There was an error!", error);
        return { res: null, error: error }
    }
};


export const getMessages = async (jobId, {signal }={}) => {
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
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/jobs/${jobId}/messages`, requestOptions, {signal});
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

export const getJobComments = async (jobId, {signal }={}) => {
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
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/v2/jobs/${jobId}/comments`, requestOptions, {signal});
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

export const getTaskComments = async (taskId, {signal }={}) => {
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
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/v2/tasks/${taskId}/comments`, requestOptions, {signal});
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



export const getAttachments = async (jobId, { signal }={}) => {
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
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/jobs/${jobId}/attachments`, requestOptions,{signal});
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