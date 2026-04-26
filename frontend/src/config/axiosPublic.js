import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:9999'

export const axiosPublic = axios.create({
    baseURL,
    withCredentials: true,
})