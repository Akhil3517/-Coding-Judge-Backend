const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;  
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
dotenv.config();
connectDB();

app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/auth');
const problemsRoutes = require('./routes/problems');
const submissionsRoutes = require('./routes/submissions');
const adminRoutes = require('./routes/admin');

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100, 
  message: 'Too many submissions from this IP, please try again after an hour'
});

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/submit', submitLimiter, submissionsRoutes);
app.use('/api/admin', adminRoutes);


const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Code Judge API',
      version: '1.0.0',
      description: 'API documentation for Code Judge'
    },
    servers: [
      { url: 'http://localhost:' + PORT }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  apis: ['./routes/*.js'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/',(req,res)=>{
    res.send('welcome');
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room ${userId}`);
  });
});

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
