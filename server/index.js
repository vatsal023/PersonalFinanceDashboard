const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/authRoutes');
const plaidRoutes = require('./routes/plaidRoutes');
const budgetRoutes = require('./routes/budgetRoutes.js');
const manualExpenseRoutes = require('./routes/manualExpenseRoutes.js');
const investmentRoutes = require("./routes/investmentRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
// inside app.js

// Load env vars


const connectDB = require('./config/db');

// Init app
const app = express();
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4000",
    "https://swifty-chatty-appy.onrender.com"
];

const corsOptions = {
    origin :(origin,callback) =>{
        if(allowedOrigins.includes(origin)|| !origin){
            callback(null,true);
        }else{
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus :204,
    credentials: true,
}
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plaid', plaidRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/manual-expenses", manualExpenseRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/analytics", analyticsRoutes);


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
