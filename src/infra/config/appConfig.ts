import "dotenv/config";
import * as env from "env-var";

const PORT = env.get("PORT").required().asString();

export const appConfig = {
	port: PORT,
};
