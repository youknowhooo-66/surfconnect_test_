import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import classRoutes from './routes/classRoutes.js';

dotenv.config();

const app = express();

// Configure CORS
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api', classRoutes); // Handles weather, student, instructor, and admin paths

// Basic health check route
app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'SurfConnect API is running smoothly.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado no servidor!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SurfConnect] Servidor rodando em http://localhost:${PORT}`);
});
