import express from "express";
import config from "../infra/config";
import { TitleController } from "./controller/title.controller";

export const app = express();

export const bootstrap = async () => {
	const asd = TitleController();

	// app.get("/I/want/title", asd.getTitleWithCallbacks);
	// app.get("/I/want/title", asd.getTitleWithAsync);

	app.get("/I/want/title", asd.getTitleWithPromises);

	app.listen(config.app.port, () => {
		console.log(`App is live at http:localhost:${config.app.port}`);
	});
};

bootstrap();
