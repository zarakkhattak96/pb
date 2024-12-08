import type { Request, Response } from "express";
import { TitleService } from "../../app/service/title.service";
import { htmlTemplate } from "../../utils/htmlTemplate";

export const TitleController = () => {
	const service = TitleService();
	return {
		getTitle: async (req: Request, res: Response) => {
			res.send(await service.getTitle(req.query.address as string));
		},

		getTitleWithCallbacks: (req: Request, res: Response) => {
			service.getTitleWithCallbacks(
				req.query.address as string,
				(err, resp) => {
					console.log(err);
					resp ? res.send(htmlTemplate(resp)) : res.send(err);
				},
			);
		},
	};
};
