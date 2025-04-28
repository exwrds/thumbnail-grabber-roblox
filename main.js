const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/get-thumbnail', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).send('missing userid');
    }

    try {
        const response = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot`, {
            params: {
                userIds: userId,
                size: '150x150',
                format: 'Png',
                isCircular: false
            }
        });
        res.json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).send('error fetching thumbnail');
    }
});

app.post('/', async (req, res) => {
    try {
        const { webhookUrl, payload } = req.body;

        if (!webhookUrl || !payload) {
            return res.status(400).json({ error: "missing webhookUrl or payload" });
        }

        // add whitelist here mayb

        const response = await axios.post(webhookUrl, payload, {
            headers: { "Content-Type": "application/json" }
        });

        if (response.status >= 200 && response.status < 300) {
            return res.status(200).json({ status: "success", code: response.status });
        } else {
            return res.status(response.status).json({ error: "webhook returned error", details: response.data });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`serv running on port ${PORT}`);
})