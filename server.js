const express = require('express');
const cors = require('cors');
const https = require('https');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 豆瓣 API 代理（通过 Node.js https 模块直接转发）
function doubanFetch(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const qs = new URLSearchParams(params).toString();
    const fullPath = endpoint + (qs ? '?' + qs : '');

    const options = {
      hostname: 'movie.douban.com',
      path: fullPath,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://movie.douban.com/',
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

// 排行榜
app.get('/api/rank', async (req, res) => {
  try {
    const data = await doubanFetch('/j/chart/top_list', {
      type: req.query.type || 11,
      interval_id: '100:90',
      action: '',
      start: req.query.start || 0,
      limit: req.query.limit || 20,
    });
    res.json({ code: 0, data });
  } catch (err) {
    res.status(500).json({ code: 500, msg: err.message });
  }
});

// 搜索
app.get('/api/search', async (req, res) => {
  try {
    const data = await doubanFetch('/j/subject_suggest', { q: req.query.q || '' });
    res.json({ code: 0, data: data || [] });
  } catch (err) {
    res.status(500).json({ code: 500, msg: err.message });
  }
});

// 轮播推荐
app.get('/api/carousel', async (req, res) => {
  try {
    const data = await doubanFetch('/j/chart/top_list', {
      type: 11, interval_id: '100:90', action: '', start: 0, limit: 5,
    });
    res.json({ code: 0, data });
  } catch (err) {
    res.status(500).json({ code: 500, msg: err.message });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
