const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection using Environment Variable
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("DB Connection Error:", err));

// User Schema Definition
const userSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    type: { type: String, enum: ['admin', 'staff', 'student'], required: true },
    sid: String, // School ID for students
    accountStatus: { type: String, default: 'active' },
    staffPortalAccess: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// --- API ENDPOINTS ---

// 1. User Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password, type } = req.body;
        // Find user by email and specific role
        const user = await User.findOne({ email: email.toLowerCase(), type });
        
        if (!user) {
            return res.status(401).json({ message: "Account not found for this role." });
        }
        
        if (user.accountStatus === 'inactive') {
            return res.status(403).json({ message: "This account has been deactivated." });
        }

        // Compare provided password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password." });
        }
        
        // Return user data (excluding password) for session storage
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json(userResponse);
    } catch (err) {
        res.status(500).json({ message: "Server error during login." });
    }
});

// 2. Student Registration
app.post('/api/register', async (req, res) => {
    try {
        const { fname, lname, sid, email, password, type } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered." });
        }

        // Hash the password before saving
        const hashed = await bcrypt.hash(password, 10);
        
        const newUser = new User({ 
            fname, 
            lname, 
            sid, 
            email: email.toLowerCase(), 
            password: hashed, 
            type 
        });

        await newUser.save();
        res.status(201).json({ message: "Account created successfully." });
    } catch (err) {
        res.status(400).json({ message: "Registration failed. Ensure all fields are valid." });
    }
});

// 3. Get All Users (For Admin Panel)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude passwords from results
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Could not fetch users." });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));