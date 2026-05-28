import axios from "axios";
import Cookies from "js-cookie";
import {addNotification} from "./notifications.action";

export const LOG_IN: string = "LOG_IN";
export const REGISTER: string = "REGISTER";
export const LOG_OUT: string = "LOG_OUT";

const computeBaseURL = () => {
    const env = process.env.REACT_APP_API_URL || '';
    // If env points to localhost or is an absolute URL, use it.
    if (env.startsWith('http') || env.includes('localhost') || env.includes('127.0.0.1')) {
        return env.startsWith('http') ? env : 'http://' + env;
    }
    // Default: use relative path so nginx can proxy /api -> backend
    return '/api';
};

const instance = axios.create({
    baseURL: computeBaseURL(),
    timeout: 5000,
    headers: {}
});

export function me(): any {

    return async (dispatch : any) => {
        try {
            const response = await instance.get('/auth/me', {
                headers: {
                    auth: Cookies.get('token')
                }
            });
            return dispatch({type: LOG_IN, email: response.data.user.username, role: response.data.user.role});
        } catch (e) {
            if (e.response === undefined) {
                return dispatch(addNotification("Error", (e as any).message));
            }
            return dispatch(addNotification("Error", "Session expired"));
        }
    }
}


export function login(email: string, password: string): any {

    return async (dispatch : any) => {
        try {
            const response = await instance.post('/auth/login', {
                username: email,
                password: password
            });
            Cookies.set('token', response.data.token);
            // fetch user info
            try {
                const meResp = await instance.get('/auth/me', { headers: { auth: Cookies.get('token') } });
                const role = meResp.data.user.role;
                return dispatch({type: LOG_IN, email: email, role});
            } catch (err) {
                return dispatch({type: LOG_IN, email: email});
            }
        } catch (e) {
            if (e.response === undefined) {
                return dispatch(addNotification("Error", (e as any).message));
            }
            return dispatch(addNotification("Error", (e as any).response.data));
        }
    }
}

export function register(email: string, password: string): any {

    return async (dispatch : any) => {
        try {
            const response = await instance.post('/auth/register', {
                username: email,
                password: password
            });

            dispatch(addNotification("Success", response.data));
            return dispatch({type: REGISTER});
        } catch (e) {
            if (e.response === undefined) {
                return dispatch(addNotification("Error", e.message));
            }
            console.log(e.response.data);
            if (e.response.data.length !== undefined) {
                return dispatch(addNotification("Error", e.response.data[0].constraints.length));
            }
            return dispatch(addNotification("Error", e.response.data));
        }
    }
}

export function logout(): ILogOutActionType {
    return { type: LOG_OUT};
}

interface ILogInActionType { type: string, email: string };
interface ILogOutActionType { type: string };
