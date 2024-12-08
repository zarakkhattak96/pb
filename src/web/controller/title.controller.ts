import type { Request, Response } from "express";
import { type RESULT, TitleService } from "../../app/service/title.service";
import { htmlTemplate } from "../../utils/htmlTemplate";

export const TitleController = () => {
	const service = TitleService();
	return {
		getTitleWithCallbacks: (req: Request, res: Response) => {
			service.getTitleWithCallbacks(
				req.query.address as string,
				(err, resp) => {
					console.log(err);
					resp ? res.send(htmlTemplate(resp)) : res.send(err);
				},
			);
		},

		getTitleWithAsync: (req: Request, res: Response) => {
			service.getTitleWithAsync(req.query.address as string, (err, resp) => {
				resp ? res.send(htmlTemplate(resp)) : res.send(err);
			});
		},

		getTitleWithPromises: (req: Request, res: Response) => {
			const resp = service.getTitleWithPromises(req.query.address as string);

			resp
				.then((resp) => res.send(htmlTemplate(resp as RESULT[])))
				.catch((err) => res.send(err));
		},
	};
};
