// Dependencies
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// GET: Avatar thumbnail
app.get('/get-thumbnail', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        const response = await axios.get('https://thumbnails.roblox.com/v1/users/avatar-headshot', {
            params: {
                userIds: userId,
                size: '150x150',
                format: 'Png',
                isCircular: false
            },
            timeout: 5000
        });
        res.json(response.data);
    } catch (error) {
        console.error('Thumbnail error:', error.message);
        res.status(500).json({ error: 'Error fetching thumbnail' });
    }
});

// POST: Webhook Queue System
const postQueue = [];
let isProcessing = false;

async function processQueue() {
    if (isProcessing || postQueue.length === 0) return;
    isProcessing = true;

    const { req, res } = postQueue.shift();
    const { webhookUrl, payload } = req.body;

    if (!webhookUrl || !payload) {
        res.status(400).json({ error: 'Missing webhookUrl or payload' });
        isProcessing = false;
        return processQueue();
    }

    try {
        const response = await axios.post(webhookUrl, payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        res.status(response.status).json({
            status: 'success',
            code: response.status
        });
    } catch (error) {
        console.error('Queue processing error:', error.message);
        const status = error.response?.status || 500;
        res.status(status).json({
            error: 'Webhook failed',
            details: error.response?.data || error.message
        });
    } finally {
        isProcessing = false;
        processQueue();
    }
}

app.post('/', (req, res) => {
    console.warn('Received POST request, queued...');
    postQueue.push({ req, res });
    processQueue();
});

// listener.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});