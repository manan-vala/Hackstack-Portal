const express = require('express');
const router = express.Router();
const mcpController = require('../controllers/mcpController');

// Load binary key fallback
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
let cachedKey = process.env.MCP_API_KEY;

if (!cachedKey) {
	try {
		const binPath = path.join(__dirname, '../mcp.bin');
		if (fs.existsSync(binPath)) {
			const encrypted = fs.readFileSync(binPath);
			const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from('12345678901234567890123456789012'), Buffer.from('1234567890123456'));
			let decrypted = decipher.update(encrypted);
			decrypted = Buffer.concat([decrypted, decipher.final()]);
			cachedKey = decrypted.toString('utf8');
		}
	} catch (e) {
		console.error("[MCP] Failed to load mcp.bin", e);
	}
}

// Auth Guard
const mcpKeyMiddleware = (req, res, next) => {
	const raw = req.headers['authorization'] ?? '';
	const key = raw.startsWith('Bearer ') ? raw.slice(7) : '';

	if (!key) {
		return res.status(401).json({ isError: true, message: 'API key required.' });
	}
	
	const validKey = process.env.MCP_API_KEY || cachedKey;
	if (key !== validKey) {
		return res.status(403).json({ isError: true, message: 'Invalid API key.' });
	}
	next();
};

// SSE Endpoint (optional for HTTP transport, but good for completeness)
router.get('/sse', mcpKeyMiddleware, (req, res) => {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders(); // flush the headers to establish SSE with client
	
	const pingInterval = setInterval(() => {
		res.write('event: ping\ndata: {}\n\n');
	}, 15000);

	req.on('close', () => {
		clearInterval(pingInterval);
		res.end();
	});
});

// JSON-RPC HTTP POST Endpoint
router.post('/', mcpKeyMiddleware, async (req, res) => {
	const body = req.body;
	
	if (!body || body.jsonrpc !== "2.0" || !body.method) {
		return res.status(400).json({
			jsonrpc: "2.0",
			id: body ? body.id : null,
			error: { code: -32600, message: "Invalid Request" }
		});
	}

	try {
		let result;
		switch (body.method) {
			case 'initialize':
				result = await mcpController.handleInitialize(body.params);
				break;
			case 'tools/list':
				result = await mcpController.handleToolsList();
				break;
			case 'tools/call':
				result = await mcpController.handleToolsCall(body.params);
				break;
			case 'notifications/initialized':
				// no-op
				return res.status(200).send();
			case 'ping':
				result = {};
				break;
			default:
				return res.status(200).json({
					jsonrpc: "2.0",
					id: body.id,
					error: { code: -32601, message: `Method not found: ${body.method}` }
				});
		}

		res.status(200).json({
			jsonrpc: "2.0",
			id: body.id,
			result: result
		});

	} catch (error) {
		console.error(`[MCP] Error handling ${body.method}:`, error);
		res.status(200).json({
			jsonrpc: "2.0",
			id: body.id,
			error: {
				code: error.code || -32000,
				message: error.message || "Internal Server Error"
			}
		});
	}
});

module.exports = router;
