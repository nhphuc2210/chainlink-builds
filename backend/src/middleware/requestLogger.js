const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`\n--- [${timestamp}] API REQUEST START ---`);
  console.log(`[API ${requestId}] 🔵 REQUEST START`, {
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      signature: req.headers['x-signature'] ? 'present' : 'missing',
      timestamp: req.headers['x-timestamp'],
      nonce: req.headers['x-nonce'],
      clientNonce: req.headers['x-client-nonce'],
      fingerprint: req.headers['x-fingerprint'] ? 'present' : 'missing',
      integrity: req.headers['x-integrity'] ? 'present' : 'missing',
      behaviorScore: req.headers['x-behavior-score'],
      userAgent: req.headers['user-agent']?.substring(0, 50) + '...',
    }
  });
  
  if (Object.keys(req.query).length > 0) {
    console.log(`[API ${requestId}] Query:`, req.query);
  }
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[API ${requestId}] Body:`, req.body);
  }
  
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    console.log(`[API ${requestId}] ✅ RESPONSE ${res.statusCode}`, { 
      duration: `${responseTime}ms`,
      hasData: !!data
    });
    console.log(`--- [${new Date().toISOString()}] API REQUEST END ---\n`);
    return originalJson(data);
  };
  
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    console.log(`[API ${requestId}] ✅ RESPONSE ${res.statusCode}`, { 
      duration: `${responseTime}ms` 
    });
    console.log(`--- [${new Date().toISOString()}] API REQUEST END ---\n`);
    return originalSend(data);
  };
  
  next();
};

export default requestLogger;
