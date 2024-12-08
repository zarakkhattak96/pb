import httpClient from "../../infra/client/httpClient";
import { htmlTemplate } from "../../utils/htmlTemplate";
import { type CALLBACK, CALLBACK_TYPE } from "../../utils/types";
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

	async function fetchTitleUtil(
		address: string,
		callback: (error: Error | null, res?: RESULT) => void,
	) {
		const client = httpClient(address);
		try {
			client.get(address, (res) => {
				let title = "";
				res.on(CALLBACK_TYPE.data, (chunk) => {
					title += chunk.toString();
				});

				res
					.on(CALLBACK_TYPE.end, () => {
						if (res.statusCode === 301 || res.statusCode === 302) {
							const location = res.headers.location;
							fetchTitleUtil(location as string, callback);
						} else {
							callback(null, {
								title: title.split("<title>")[1].split("</title>")[0],
								address: address,
							});
						}
					})
					.on(CALLBACK_TYPE.error, (err) => {
						console.log(err, "ERRRRRRR");

						callback(err, {
							title: "NO RESPONSE",
							address: address,
						});
					});
			});
		} catch (err) {
			callback(err as Error, {
				title: "NO RESPONSE",
				address: address,
			});
		}
	}
};
