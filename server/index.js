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
const incomeRoutes = require("./routes/incomeRoutes");
const mutualFundRoutes = require("./routes/mutualFundsRoutes");
const csvRoutes = require("./routes/csvRoutes");
const startFinnhubServer = require('./finnhubserver');
const finnhubRoutes = require("./routes/finnhubRoutes");
const shareRoutes = require("./routes/shareRoutes");
const yahooFinanceRoutes = require("./routes/yahooFinanceRoutes");
const yahooFinance = require("./routes/yahooFinance");
const metalRoutes = require("./routes/metalRoutes");
const mfRoutes = require("./routes/mfRoutes");
const bullionRoutes = require("./routes/bullionRoutes");
// const amcRoutes = require("./routes/amc");
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
app.use("/api/expenses", manualExpenseRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/income", incomeRoutes)
app.use("/api/mutualfunds", mutualFundRoutes);
app.use("/api/csv", csvRoutes);
app.use("/api/finnhub", finnhubRoutes);
app.use("/api/shares", shareRoutes);
// app.use("/api/yahoo", yahooFinanceRoutes);
app.use("/api/yahoo", yahooFinance);
app.use("/api/metal", metalRoutes);
app.use("/api/mf",mfRoutes);

// app.use("/api/mutual-funds", amcRoutes);
app.use("/api/mutual-funds",require("./routes/AMFI"));
app.use("/api/bullions", bullionRoutes);
// Start server
const PORT = process.env.PORT || 4000;
const server = startFinnhubServer(app); 
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
