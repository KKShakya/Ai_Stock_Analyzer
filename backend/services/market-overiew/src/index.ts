import app from "./app";

import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 5003;

app.listen(port, () => {
  console.log(`Market Service running on port ${port}`);
});
