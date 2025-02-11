import dotenv from 'dotenv';
import { app } from './app.js';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
}); 