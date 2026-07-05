const doubanFetch = require('./douban');

module.exports = async (req, res) => {
  try {
    const data = await doubanFetch('/j/subject_suggest', { q: req.query.q || '' });
    res.status(200).json({ code: 0, data: data || [] });
  } catch (err) {
    res.status(500).json({ code: 500, msg: err.message });
  }
};
