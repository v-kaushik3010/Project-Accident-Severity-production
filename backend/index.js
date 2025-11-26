const express = require('express')
const axios = require('axios')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())


// Configure: where the model server runs
const MODEL_SERVER = process.env.MODEL_SERVER_URL || 'http://localhost:8000'


app.post('/api/predict', async (req, res) => {
    try {
        // Validate incoming fields (simple)
        const payload = req.body
        // forward to Python model server
        const resp = await axios.post(`${MODEL_SERVER}/predict`, payload, { timeout: 20000 })
        res.json(resp.data)
    } catch (err) {
        console.error('predict error', err?.message || err)
        res.status(500).json({ error: err?.response?.data || err.message })
    }
})


app.listen(5000, () => console.log('Node backend listening on http://localhost:5000'))