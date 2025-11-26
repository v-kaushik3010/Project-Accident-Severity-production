import axios from 'axios'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
export async function predictSeverity(payload) {
    const resp = await axios.post(`${API_BASE}/api/predict`, payload)
    return resp.data
}