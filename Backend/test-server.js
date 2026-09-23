import express from "express";
import authRoutes from "./Routes/authRoutes.js";
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.listen(5001, () => {
  console.log("Listening on 5001");
  import("axios").then(async axios => {
    try {
      let api = axios.default.create({ baseURL: "http://localhost:5001/api" });
      let res = await api.post("/auth/google/exchange", { code: "a".repeat(64) }, { validateStatus: () => true });
      console.log("Exchange Status:", res.status);
      process.exit(0);
    } catch(e) {
      console.log(e);
      process.exit(1);
    }
  })
});
