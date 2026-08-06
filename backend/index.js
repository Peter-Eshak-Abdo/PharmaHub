const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// ربط المسارات الخاصة بالـ Auth والـ Users
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
  res.send('PharmaHub API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});