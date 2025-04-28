const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

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
        res.status(500).send('err fetching thumb');
    }
});

app.listen(PORT, () => {
    console.log(`serv running on port ${PORT}`);
});