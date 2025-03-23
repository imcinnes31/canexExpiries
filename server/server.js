import express from "express";
import cors from "cors";
import expiries from "./routes/routes.js";
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/expiries", expiries);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

