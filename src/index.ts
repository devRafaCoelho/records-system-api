import 'dotenv/config';
import express from 'express';
import routes from './routes';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

app.listen(process.env.API_PORT, () => {
  console.log(`API connected on port ${process.env.API_PORT}`);
});
