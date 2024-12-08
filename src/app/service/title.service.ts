import fetchTitleUtil from "../../utils/fetchTitle.util";
import { htmlTemplate } from "../../utils/htmlTemplate";
import type { CALLBACK } from "../../utils/types";
import async from "async";

export type RESULT = { title: string; address: string };

export const TitleService = () => {
	return {
		getTitle: async (address: string | string[]) => {
			let addresses = [];
			if (typeof address === "string") {
				addresses = [address];
			} else {
				addresses = address;
			}

			const resp = await Promise.all(addresses.map((a) => fetchTitle(a)));
			const addressesWithTitle: { title: string; address: string }[] = resp;

			return htmlTemplate(addressesWithTitle);
		},

		getTitleWithCallbacks: (address: string | string[], callback: CALLBACK) => {
			let addresses = [];

			if (typeof address === "string") {
				addresses = [address];
			} else {
				addresses = address;
			}

			const responses: RESULT[] = [];

			for (const a of addresses) {
				fetchTitleUtil(a, (err, resp) => {
					responses.push(resp as RESULT);

					if (responses.length === addresses.length) {
						callback(null, responses);
					}
				});
			}
		},

		getTitleWithAsync: (address: string | string[], callback: CALLBACK) => {
			let addresses = [];

			if (typeof address === "string") {
				addresses = [address];
			} else {
				addresses = address;
			}

			// console.log("Addresses to process:", addresses);

			async.map(
				addresses,
				(address, callback) => {
					console.log(`Processing address: ${address}`);
					fetchTitleUtil(address, (err, resp) => {
						if (err) {
							callback(err, {
								address: address as string,
								title: "NO RESPONSE",
							});
						}

						callback(null, resp);
					});
				},
				(err, result) => {
					// console.log(err, result, "RESULTTTTT");
					if (err) {
						callback(err, [
							{ address: address as string, title: "NO RESPONSE" },
						]);
					} else {
						callback(null, result as RESULT[]);
					}
				},
			);
		},

		getTitleWithPromises: (address: string | string[]) => {
			let addresses = [];

			if (typeof address === "string") {
				addresses = [address];
			} else {
				addresses = address;
			}

			return new Promise((resolve, reject) => {
				const promises = addresses.map((a) => fetchTitle(a));

				resolve(Promise.all(promises));
			});
		},
	};

	async function fetchTitle(address: string) {
		let title = "";
		try {
			const html = await fetch(address).then((r) => r.text());
			title = html.split("<title>")[1].split("</title>")[0];
		} catch (err) {
			title = "NO RESPONSE";
		}
		return {
			title,
			address,
		};
	}
};
