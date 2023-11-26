export const checkPermission = (option) => navigator.permissions.query(option)

export const requestPermission = (option) => navigator.mediaDevices?.getUserMedia ? navigator.mediaDevices.getUserMedia({ audio: true }) : Promise.reject("api-get-user-media-error")

export default {checkPermission, requestPermission}