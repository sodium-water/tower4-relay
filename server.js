const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });
const rooms = new Map();
wss.on('connection', ws => {
  let room = null;
  ws.on('message', (data, isBin) => {
    const str = isBin ? data.slice(0, 40).toString('utf8') : data.toString('utf8');
    const parts = str.split('|');
    if (parts.length >= 2) {
      const code = parts[1].toUpperCase();
      if (!rooms.has(code)) rooms.set(code, new Set());
      room = rooms.get(code);
      room.add(ws);
      if (parts[0] === 'J') return;
      for (const client of room) {
        if (client !== ws && client.readyState === WebSocket.OPEN) client.send(data, { binary: isBin });
      }
    }
  });
  ws.on('close', () => { if (room) room.delete(ws); });
});
