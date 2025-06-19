const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/get-thumbnail', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).send('Missing userId');
    }

    try {
        const { data } = await axios.get('https://thumbnails.roblox.com/v1/users/avatar-headshot', {
            params: {
                userIds: userId,
                size: '150x150',
                format: 'Png',
                isCircular: false
            }
        });
        res.json(data);
    } catch (error) {
        console.error('Thumbnail error:', error.message);
        res.status(500).send('Error fetching thumbnail');
    }
});

// simple queue thing for post requests
const postQueue = [];
let isProcessing = false;

async function processQueue() {
    if (isProcessing || postQueue.length === 0) return;
    isProcessing = true;

    const { req, res } = postQueue.shift();

    try {
        const { webhookUrl, payload } = req.body;
        
        console.log(webhookUrl, payload)
        
        if (!webhookUrl || !payload) {
            res.status(400).json({ error: 'missing webhookUrl or payload' });
        } else {
            const response = await axios.post(webhookUrl, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status >= 200 && response.status < 300) {
                res.status(200).json({ status: 'success', code: response.status });
            } else {
                print(response.data)
                res.status(response.status).json({ error: 'Webhook returned error', details: response.data });
            }
        }
    } catch (error) {
        console.error('POST queue err:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        isProcessing = false;
        processQueue();
    }
}

app.post('/', (req, res) => {
    console.warn(`received post request, handling...`)
    postQueue.push({ req, res });
    processQueue();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});