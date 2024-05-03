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

export const changePassword = async (data) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json","Authorization": `Bearer ${data.authToken}` },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/user/change-password`, requestOptions);
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

export const createTask = async (data) => {
    const authToken = localStorage.getItem("authToken");
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

export const updateTask = async (data,taskId) => {
    const authToken = localStorage.getItem("authToken");
    const requestOptions = {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${authToken}`, 
        },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/tasks/${taskId}`, requestOptions);
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

export const getJobs = async (page) => {
    const authToken = localStorage.getItem('authToken');
    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${authToken}`,
        }
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/jobs?page=${page}`, requestOptions);;
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

export const getJobsByFilter = async (filter) => {
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
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/jobs/filter?${filter}`, requestOptions);;
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

export const getTasksByFilter = async (filter) => {
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
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/tasks/filterbyfields?${filter}`, requestOptions);
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


export const deleteJobs = async (data) => {
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
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/jobs/bulkdelete`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log("response in delete api", response,data);
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


export const updateJobs = async (res) => {
    const authToken = localStorage.getItem('authToken');
    const requestOptions = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${authToken}`, 
        },
        body: JSON.stringify(res?.dataObj),
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/jobs/${res?.job_id}`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log("response in delete api", response,data);
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


export const createJobs = async (data) => {
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
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/create-job`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log("response in delete api", response,data);
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

export const createInvoice = async (data) => {
    const authToken = localStorage.getItem("authToken");
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
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/invoices`, requestOptions);
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
