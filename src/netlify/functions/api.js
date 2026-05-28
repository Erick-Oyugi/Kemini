import express from "express";
import serverless from "serverless-http";
const app = express();
app.use(express.json());
app.get("/hello", (req, res) => {
    res.json({ message: "Hello from Express on Netlify!" });
});
app.post("/data", (req, res) => {
    res.json({
        received: req.body,
    });
});
// Wrap Express app for Netlify
export const handler = serverless(app);
//# sourceMappingURL=api.js.map