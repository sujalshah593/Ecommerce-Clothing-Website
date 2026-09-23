import express from "express";
import authRoutes from "./Routes/authRoutes.js";
const app = express();
app.use("/api/auth", authRoutes);
const routes = [];
app._router.stack.forEach(middleware => {
  if (middleware.route) routes.push(middleware.route);
  else if (middleware.name === 'router') middleware.handle.stack.forEach(handler => {
    routes.push(handler.route);
  });
});
console.log(routes.map(r => r ? r.path : null));
