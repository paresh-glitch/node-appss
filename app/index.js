const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// only connect to MongoDB if not in test mode
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB connected!'))
        .catch(err => console.error('MongoDB error:', err));
}

// User schema
const userSchema = new mongoose.Schema({
    name:      { type: String, required: true },
    city:      { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// routes
app.get('/', (req, res) => {
    res.json({ message: 'Node + MongoDB running!', status: 'ok' });
});

app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1
        ? 'connected' : 'disconnected';
    res.json({ status: 'healthy', database: dbStatus });
});

app.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.post('/users', async (req, res) => {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
});

app.delete('/users/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'deleted' });
});

// server defined BEFORE module.exports!
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = server;   // ← now server exists!
