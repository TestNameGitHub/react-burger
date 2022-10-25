import {
  getCookie,
  setCookie,
  deleteCookie
} from '../cookies';

import {History} from 'history';

import {
  IS_REQUESTING,
  IS_FAILED,
  IS_SUCCESSFUL
} from '../constants';

import {AppDispatch, AppThunk} from '../types';
import {TUser} from '../types/data';
import { BASE_URL } from "../../utils/constants";
import checkResponse from "../../utils/checkResponse";

export interface IIsRequesting {
  readonly type: typeof IS_REQUESTING
}

export interface IIsFailed {
  readonly type: typeof IS_FAILED
}

export interface IIsSuccessful {
  readonly type: typeof IS_SUCCESSFUL
  readonly isAuth: boolean
}

export const isRequestingAction = (): IIsRequesting => ({
  type: IS_REQUESTING
})

export const isFailedAction = (): IIsFailed => ({
  type: IS_FAILED
})

export const isSuccessfulAction = (isAuth: boolean): IIsSuccessful => ({
  type: IS_SUCCESSFUL,
  isAuth: isAuth
})

export type TUserActions =
  | IIsRequesting
  | IIsFailed
  | IIsSuccessful;

const AUTH = `${BASE_URL}/auth`;

export const register: AppThunk = ({email, password, name}: TUser) => (dispatch: AppDispatch) => {
  dispatch(isRequestingAction());
  fetch(AUTH + '/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      name
    })
  })
    .then(checkResponse)
    .then(res => {
      if (res.success) {
        dispatch(isSuccessfulAction(true));
        setCookie('accessToken', res.accessToken, {expires: 20 * 60});
        setCookie('refreshToken', res.refreshToken);
      } else {
        dispatch(isFailedAction());
      }
    })
    .catch(err => {
      dispatch(isFailedAction());
    })
}

export const loginning: AppThunk = ({email, password}: TUser) => (dispatch: AppDispatch) => {
  dispatch(isRequestingAction());
  fetch(AUTH + '/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  })
    .then(checkResponse)
    .then(res => {
      if (res.success) {
        dispatch(isSuccessfulAction(true));
        setCookie('accessToken', res.accessToken, {expires: 20 * 60});
        setCookie('refreshToken', res.refreshToken);
      } else {
        dispatch(isFailedAction());
      }
    })
    .catch(err => {
      dispatch(isFailedAction());
    });
}

export const loggingOut: AppThunk = () => (dispatch: AppDispatch) => {
  dispatch(isRequestingAction());
  fetch(AUTH + '/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: getCookie('refreshToken')
    })
  })
    .then(checkResponse)
    .then(res => {
      if (res.success) {
        dispatch(isSuccessfulAction(false));
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
      } else {
        dispatch(isFailedAction());
      }
    })
    .catch(err => {
      dispatch(isFailedAction());
    });
}

export const forgotPassword: AppThunk = (email: string, history: History, location: string) => (dispatch: AppDispatch) => {
  dispatch(isRequestingAction());
  fetch(`${BASE_URL}/password-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email
    })
  })
    .then(checkResponse)
    .then(res => {
      if (res.success) {
        history.push("/reset-password", {from: location});
      } else {
        dispatch(isFailedAction());
      }
    })
    .catch(err => {
      dispatch(isFailedAction());
    })
}

export const resetPassword: AppThunk = (password: string, token: string, history: History) => (dispatch: AppDispatch) => {
  dispatch(isRequestingAction());

  fetch(`${BASE_URL}/password-reset/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password,
      token
    })
  })
    .then(checkResponse)
    .then(res => {
      if (res.success) {
        history.replace("/login")
      } else {
        dispatch(isFailedAction());
      }
    })
    .catch(err => {
      dispatch(isFailedAction());
    })
}

export const getUserInfo: AppThunk = (formData: TUser, setFormData: Function) => (dispatch: AppDispatch) => {
  dispatch(isRequestingAction());

  if (!getCookie('accessToken')) {
    getToken();
  }

  fetch(AUTH + '/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': getCookie('accessToken') || 'undefined',
    }
  })
    .then(checkResponse)
    .then(res => {
      if (res.success) {
        setFormData({...formData, ...res.user});
      } else {
        dispatch(isFailedAction());
      }
    })
    .catch(e => {
      dispatch(isFailedAction());
    })
}

export const updateUserInfo: AppThunk = (formData: TUser) => (dispatch: AppDispatch) => {
  dispatch(isRequestingAction());

  if (!getCookie('accessToken')) {
    getToken();
  }

  fetch(AUTH + '/user', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'authorization': getCookie('accessToken') || 'undefined',
    },
    body: JSON.stringify({...formData})
  })
    .then(checkResponse)
    .then(res => {
      if (res.success) {
        console.log('SUCCESS');
      } else {
        dispatch(isFailedAction());
      }
    })
    .catch(e => {
      if ((e as { message: string }).message === "jwt expired") {
        getToken();
      } else {
        dispatch(isFailedAction());
      }
    })
}

export const getToken: AppThunk = () => (dispatch: AppDispatch) => {
  console.log('getToken');
  dispatch(isRequestingAction());
  fetch(AUTH + '/token', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({
      token: getCookie('refreshToken')
    })
  })
    .then(checkResponse)
    .then(res => {
      if (res.success) {
        setCookie('accessToken', res.accessToken, {expires: 20 * 60});
        setCookie('refreshToken', res.refreshToken);
      } else {
        dispatch(isFailedAction());
      }
    })
    .catch(err => {
      dispatch(isFailedAction());
    })
}