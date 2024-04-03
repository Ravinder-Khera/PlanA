export const SignIn = async (data) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/register`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log('response ----',data ,response);
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

export const LogIn = async (data) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/login`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response,data);
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

export const forgotPassword = async (data) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/forgot-password`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response,data);
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

export const resetPassword = async (data) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/reset-password`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response,data);
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

export const getProfile = async (data) => {
    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${data}`,
        },
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/get-my-profile`, requestOptions);;
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response,data);
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

export const updateProfile = async (data,authToken) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json","Authorization":`Bearer ${authToken}` },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/update-my-profile`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response,data);
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

export const updateProfilePicture = async (formData) => {
    const authToken = localStorage.getItem('authToken');

    const requestOptions = {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` },
        body: formData,
    };

    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/update-my-profile-pic`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response, data);
        if (response.status === 200) {
            return { res: data, error: null };
        } else {
            return { res: null, error: data };
        }
    } catch (error) {
        console.error("There was an error!", error);
        return { res: null, error: error };
    }
};

export const deleteInvoices = async (data,authToken) => {
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
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/invoices/bulk-delete`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response,data);
        if(response.status === 202){
            return { res: data, error: null } ;
        }else{
            return { res: null, error: data } ;
        }
    } catch (error) {
        console.error("There was an error!", error);
        return { res: null, error: error }
    }
};

export const getTasks = async (data) => {
    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${data}`,
        },
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/tasks`, requestOptions);;
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response,data);
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

export const getTasksByStatus = async (data) => {
    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${data}`,
        },
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/tasks/by-status-and-date`, requestOptions);;
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response,data);
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

export const getJobIds = async (data) => {
    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${data}`,
        },
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/jobs/ids`, requestOptions);;
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response,data);
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

export const getUserByRole = async (data) => {
    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${data}`,
        },
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/users/role/assignee`, requestOptions);;
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response,data);
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

export const createTask = async (data,authToken) => {
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
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/tasks`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response,data);
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

export const getDashboardSummary = async (data) => {
    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${data}`,
        },
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/dashboard/summary`, requestOptions);;
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response,data);
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