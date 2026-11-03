const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function test() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(process.env.TEMP, 'edge_debug_' + Date.now());

  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  edge.stdout.on('data', d => console.log('Edge stdout:', d.toString()));
  edge.stderr.on('data', d => console.log('Edge stderr:', d.toString()));

  await new Promise(r => setTimeout(r, 1500));

  const listRes = await fetch('http://127.0.0.1:9222/json');
  const list = await listRes.json();
  console.log('Targets:', list.map(t => ({ title: t.title, type: t.type, url: t.webSocketDebuggerUrl })));

  const pageTarget = list.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  console.log('WS connected!');

  ws.onmessage = (e) => {
    console.log('WS message received:', e.data.slice(0, 100));
  };

  ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
  ws.send(JSON.stringify({ id: 2, method: 'Page.navigate', params: { url: 'http://localhost:4173/welcome' } }));

  await new Promise(r => setTimeout(r, 2000));

  ws.send(JSON.stringify({ id: 3, method: 'Page.captureScreenshot', params: { format: 'png' } }));

  await new Promise(r => setTimeout(r, 2000));
  ws.close();
  edge.kill();
}

test().catch(console.error);

