const fs = require('fs');
const path = require('path');
const http = require('http');

const METRICS_URL = process.env.METRICS_URL || 'http://localhost:3000/metrics';
const OUT_DIR = path.join(
  __dirname,
  '..',
  'coverage',
  'lcov-report',
  'metrics'
);

function parseMetrics(text, metricNames) {
  const lines = text.split('\n');
  const values = {};
  metricNames.forEach((name) => (values[name] = 0));

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([a-zA-Z0-9_:]+)(?:\{[^}]*\})?\s+(\S+)$/);
    if (m) {
      const key = m[1];
      const val = parseFloat(m[2]);
      if (
        !Number.isNaN(val) &&
        Object.prototype.hasOwnProperty.call(values, key)
      ) {
        values[key] = val;
      }
    }
  }
  return values;
}

function fetchMetrics(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      })
      .on('error', (err) => reject(err));
  });
}

(async () => {
  try {
    console.log('Fetching metrics from', METRICS_URL);
    const res = await fetchMetrics(METRICS_URL);
    if (res.status !== 200) throw new Error('Non-200 response: ' + res.status);
    const txt = res.body;

    const metricNames = [
      'process_cpu_user_seconds_total',
      'process_resident_memory_bytes',
      'nodejs_heap_size_total_bytes',
      'nodejs_eventloop_lag_seconds',
    ];

    const values = parseMetrics(txt, metricNames);
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(OUT_DIR, 'metrics.json'),
      JSON.stringify(
        { collected_at: new Date().toISOString(), values },
        null,
        2
      )
    );

    // write a simple HTML that reads metrics.json and renders Chart.js (CDN)
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Runtime metrics</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}#chart{max-width:900px}</style>
</head>
<body>
  <h1>Runtime metrics</h1>
  <canvas id="chart" width="800" height="400"></canvas>
  <script>
    async function load() {
      const r = await fetch('./metrics.json');
      const j = await r.json();
      const labels = Object.keys(j.values);
      const data = labels.map(k => j.values[k]);
      const ctx = document.getElementById('chart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Value', data, backgroundColor: 'rgba(54,162,235,0.6)' }] },
        options: { scales: { y: { beginAtZero: true } } }
      });
    }
    load().catch(console.error);
  </script>
</body>
</html>`;

    fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html);
    console.log('Wrote metrics JSON and index.html to', OUT_DIR);
    process.exit(0);
  } catch (err) {
    console.error('Failed to generate metrics JSON/HTML:', err);
    process.exit(2);
  }
})();
