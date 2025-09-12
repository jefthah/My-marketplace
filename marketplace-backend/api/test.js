module.exports = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  
  res.end(JSON.stringify({
    message: 'Test API endpoint working!',
    endpoint: '/api/test',
    method: req.method,
    timestamp: new Date().toISOString()
  }));
};