import dotenv from "dotenv";
import connectDb from "./db/databaseConnect.js";
import { app } from "./app.js";
dotenv.config({ path: "../.env" });

connectDb()
.then(() => {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`SERVER RUNNING AT PORT ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO DB CONNECTION FAILED", err);
})
