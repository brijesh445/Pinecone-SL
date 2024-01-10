import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

import temp_router from "./routes/temperature";
import proximity_router from "./routes/proximity";
import luminosity_router from "./routes/luminosity";
import ldr_router from "./routes/ldr";
import led_status_router from "./routes/led_status";
import iot_dumps_router from "./routes/iot_dumps";

// env and configurations
dotenv.config();
// const allowedOrigins = [];
const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000'];
const port = process.env.PORT || 3000;
// env and configurations

const app = express();

// security
app.use(helmet());
app.disable('x-powered-by');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Use an external store for consistency across multiple server instances.
})
app.use(limiter);
// security

app.use(express.json());
app.use(cors({ origin: allowedOrigins }));

// router paths
app.use("/iot_dumps", iot_dumps_router);
app.use("/temperature", temp_router);
app.use("/proximity", proximity_router);
app.use("/luminosity", luminosity_router);
app.use("/ldr", ldr_router);
app.use("/led_status", led_status_router);
// router paths

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
    // res.redirect("/iot_dumps");
});