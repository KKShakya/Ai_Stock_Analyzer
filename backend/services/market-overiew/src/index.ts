import app from "./app";

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`Market Service running on port ${port}`);
});
