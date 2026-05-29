import axios from 'axios';
import { IProduct } from '../models/product.interface';
import { addNotification } from './notifications.action';

const computeBaseURL = () => {
    const env = process.env.REACT_APP_API_URL || '';
    if (!env.trim()) {
        return '/api';
    }
    return env.startsWith('http') ? env : `https://${env}`;
};

const instance = axios.create({
    baseURL: computeBaseURL(),
    timeout: 5000,
    withCredentials: true,
});

export function getProducts(): any {
    return async (dispatch: any) => {
        try {
            const resp = await instance.get('/product');
            return dispatch({ type: 'SET_PRODUCTS_FROM_SERVER', products: resp.data });
        } catch (e) {
            dispatch(addNotification('Error', 'Failed to load products'));
        }
    };
}

export function createProduct(product: IProduct): any {
    return async (dispatch: any) => {
        try {
            const resp = await instance.post('/product', product);
            dispatch(addNotification('Success', 'Product created'));
            return dispatch({ type: 'ADD_PRODUCT', product: resp.data });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.debug('createProduct error', e);
            const msg = (e && (e as any).response && (e as any).response.data) ? (e as any).response.data : 'Failed to create product';
            dispatch(addNotification('Error', msg));
        }
    };
}

export function updateProduct(product: IProduct): any {
    return async (dispatch: any) => {
        try {
            await instance.patch(`/product/${product.id}`, product);
            dispatch(addNotification('Success', 'Product updated'));
            return dispatch({ type: 'EDIT_PRODUCT', product });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.debug('updateProduct error', e);
            const msg = (e && (e as any).response && (e as any).response.data) ? (e as any).response.data : 'Failed to update product';
            dispatch(addNotification('Error', msg));
        }
    };
}

export function deleteProduct(id: number): any {
    return async (dispatch: any) => {
        try {
            await instance.delete(`/product/${id}`);
            dispatch(addNotification('Success', 'Product deleted'));
            return dispatch({ type: 'REMOVE_PRODUCT', id });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.debug('deleteProduct error', e);
            const msg = (e && (e as any).response && (e as any).response.data) ? (e as any).response.data : 'Failed to remove product';
            dispatch(addNotification('Error', msg));
        }
    };
}
