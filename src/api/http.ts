import axios from 'axios'
import { env } from '@/config/env'

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
})
