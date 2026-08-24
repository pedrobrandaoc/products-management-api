import { env } from "./config/env.js";
import { app } from './app.js';

const PORT = env.PORT || 3000

// coloca o servidor para receber requisições.
app.listen(PORT, () => {
  console.log(`The server is running on port: ${PORT}`);
});
