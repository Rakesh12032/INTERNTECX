import app from "./index.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`InternTech server running at http://localhost:${PORT}`);
});
