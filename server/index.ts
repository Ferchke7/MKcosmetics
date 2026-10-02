import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { DbService } from './services/dbService.js';
import { TelegramSyncWorker } from './services/telegramSyncWorker.js';
import { VisitorStatsService } from './services/visitorStatsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for real IP detection behind Nginx / Cloudflare
app.set('trust proxy', true);

// 1. Initialize persistent database, background sync worker & visitor stats
DbService.init();
TelegramSyncWorker.start();
VisitorStatsService.init();

// 2. Middleware
app.use(cors());
app.use(express.json());

// Helper to extract clean client IP
function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

// 3. API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    totalPosts: DbService.getPosts().length,
    lastSync: DbService.getLastSync() ? new Date(DbService.getLastSync()).toISOString() : null,
    timestamp: new Date().toISOString(),
  });
});

// Primary Feed Endpoint: Serves from persistent database in 0ms!
app.get('/api/telegram/feed', (req, res) => {
  try {
    const posts = DbService.getPosts();
    const channelInfo = DbService.getChannel();

    res.json({
      success: true,
      data: {
        channelInfo,
        posts,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/telegram/feed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve stored Telegram feed',
      message: error.message,
    });
  }
});

// Force Sync Endpoint
app.post('/api/telegram/sync', async (req, res) => {
  try {
    const result = await TelegramSyncWorker.syncNow();
    res.json({
      success: true,
      message: 'Sync completed',
      added: result.addedCount,
      total: result.totalCount,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Visitor Track & Geo IP Endpoint
app.post('/api/visitor/track', (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const countryCode = req.body?.countryCode || 'UZ';
    VisitorStatsService.recordVisit(countryCode);
    const stats = VisitorStatsService.getStats();

    res.json({
      success: true,
      clientIp,
      ...stats,
    });
  } catch (error: any) {
    res.json({
      success: true,
      clientIp: getClientIp(req),
      ...VisitorStatsService.getStats(),
    });
  }
});

// Visitor Stats Endpoint
app.get('/api/visitor/stats', (req, res) => {
  const clientIp = getClientIp(req);
  res.json({
    success: true,
    clientIp,
    ...VisitorStatsService.getStats(),
  });
});

// 4. Production Static File Serving
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) {
        res.status(200).send('MK KOREA COSMETIC Server Running. In development, open http://localhost:5173');
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`🌸 MK COSMET Server listening on http://localhost:${PORT}`);
  console.log(`💾 Database loaded with ${DbService.getPosts().length} posts from local storage.`);
});
