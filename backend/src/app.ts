import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port: number = parseInt(process.env.PORT || "5501");

app.get("/", (req, res) => {
  console.log("GET / called");
  res.send("Hello World");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});
