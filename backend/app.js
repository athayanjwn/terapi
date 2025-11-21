import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js'
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = parseInt(process.env.PORT, 10);
const app = express();

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3001'
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes)

app.get('/', (req,res) => {
    res.send('API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
