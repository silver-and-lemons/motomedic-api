import app from "./src/app.js";
import { config } from "./src/shared/config/env.js";
import { logger } from "./src/shared/utils/logger.js";

app.listen(config.port, () => {
  logger.info(`Server running on http://localhost:${config.port}`);
});
