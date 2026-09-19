import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ORION Maintenance Lite API',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ORION backend corriendo en el puerto ${PORT}`);
});