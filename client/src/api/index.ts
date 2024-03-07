import axios, { AxiosRequestConfig } from 'axios'

const axiosClient = axios.create()

export const get = async (url: string, config?: AxiosRequestConfig) => {
  const { data } = await axiosClient.get(url, config)
  return data
}

export const post = async (url: string, payload: any, config?: AxiosRequestConfig<any>) => {
  const { data } = await axios.post(url, payload, config)
  return data
}

let baseUrl
if (MODE === 'development') {
  baseUrl = '/api'
}
if (MODE === 'production') {
  baseUrl = API_BASE_URL
}

export const PATHS = {
  urlConverter: `${baseUrl}/converter`,
  urlHealthCheck: `${baseUrl}/converter/health-check`
}

export const projectKeys = {
  urlConverter: 'urlConverter',
  urlHealthCheck: 'urlHealthCheck'
}
