const databaseconfig = require('./src/config/databaseConfig')
const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors');
const router = require('./src/routers/index');
const cookieparser = require('cookie-parser');
const morgan = require('morgan');

dotenv.config();

const app = express();


app.use(morgan('dev'));

// Express middleware
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(cookieparser());

app.use(express.json());

app.use('/api', router);

// Connect database
databaseconfig();

// Start server
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
    try {
        console.log(`🚀 Server đã được khởi tạo và chạy ở cổng ${PORT}`)
    } catch (error) {
        console.error('Lỗi khi khởi tạo server:', error);
    }
});

