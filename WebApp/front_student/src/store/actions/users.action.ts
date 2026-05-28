import { IUser } from "../models/user.interface";
import axios from "axios";
export const ADD_ADMIN: string = "ADD_ADMIN";
export const GET_USERS: string = "GET_USERS";
export const REMOVE_ADMIN: string = "REMOVE_ADMIN";

const computeBaseURL = () => {
    const env = process.env.REACT_APP_API_URL || '';
    if (env.startsWith('http') || env.includes('localhost') || env.includes('127.0.0.1')) {
        return env.startsWith('http') ? env : 'http://' + env;
    }
    return '/api';
};

const instance = axios.create({
    baseURL: computeBaseURL(),
    timeout: 5000,
    headers: {},
    withCredentials: true,
});


export function addAdmin(user: IUser): any {
    return async (dispatch : any) => {
        try {
            await instance.patch('/user/' + user.id, {
                username: user.username, role : "ADMIN"
            });
            return dispatch({ type: ADD_ADMIN, user: user });
        } catch (e) {
            console.log(e);
        }
    }
}

export function removeAdmin(user: IUser): (dispatch: any) => Promise<any> {
    return async (dispatch : any) => {
        try {
            await instance.patch('/user/' + user.id, {
                username: user.username, role : "NORMAL"
            });
            return dispatch({ type: REMOVE_ADMIN, user: user });
        } catch (e) {
            console.log(e);
        }
    }
}
export function getUsers(): any {

    return async (dispatch : any) => {
        try {
            const response = await instance.get('/user');
            const tmpUsers : IUser[] = response.data;
            let users : IUser[] = [];
            let admins : IUser[] = [];
            tmpUsers.forEach((user : IUser) => {
                if (user.role === "ADMIN") {
                    admins.push(user);
                }
                else {
                    users.push(user);
                }
            })
            return dispatch({type: GET_USERS, admins, users});
        } catch (e) {
            console.log(e);
        }
    }
}
