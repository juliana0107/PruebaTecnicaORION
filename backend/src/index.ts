import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pool from './config/database';
import assetRoutes from './modules/assets/asset.routes';
import catalogRoutes from './modules/catalogs/catalog.routes';
import workOrderRoutes from './modules/work-orders/workOrder.routes';
import crewRoutes from './modules/crews/crew.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ORION Maintenance Lite API',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de módulos
app.use('/api/assets', assetRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/crews', crewRoutes);
// Manejo de rutas no encontradas y errores
app.use(notFoundHandler);
app.use(errorHandler);

async function initDb(): Promise<void> {
  try {
    const sqlPath = path.join(__dirname, 'db', 'init.sql');
    if (!fs.existsSync(sqlPath)) {
      console.warn('[DB_INIT] init.sql no encontrado, se omite');
      return;
    }
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    await pool.query(sql);
    console.log('[DB_INIT] Base de datos inicializada correctamente');
  } catch (err) {
    console.error('[DB_INIT] Error inicializando base de datos:', err);
  }
}

app.listen(PORT, async () => {
  console.log(`Servidor ORION backend corriendo en el puerto ${PORT}`);
  await initDb();
});