const doubanFetch = require('./douban');

module.exports = async (req, res) => {
  try {
    const data = await doubanFetch('/j/chart/top_list', {
      type: req.query.type || 11,
      interval_id: '100:90',
      action: '',
      start: req.query.start || 0,
      limit: req.query.limit || 20,
    });
    res.status(200).json({ code: 0, data });
  } catch (err) {
    res.status(500).json({ code: 500, msg: err.message });
  }
};
