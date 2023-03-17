const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

app.get('/api', async (req, res) => {
  try {
    const { url, ...params } = req.query;
    const response = await axios.get(url, { params });
    res.json(response.data);
  } catch (error) {
    console.error('Error in proxy:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`CORS proxy server listening at http://localhost:${port}`);
});
