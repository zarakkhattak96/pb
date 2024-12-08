import httpClient from "../../infra/client/httpClient";
import fetchTitleUtil from "../../utils/fetchTitle.util";
import type { CALLBACK } from "../../utils/types";
import async from "async";

export type RESULT = { title: string; address: string };

export const TitleService = () => {
	return {
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
				const promises = addresses.map((a) => fetchTitleWithPromise(a));

				resolve(Promise.all(promises));
			});
		},
	};

	async function fetchTitleWithPromise(address: string) {
		return new Promise((resolve, reject) => {
			const client = httpClient(address);

			try {
				client.get(address, (res) => {
					let title = "";
					res.on("data", (chunk) => {
						title += chunk.toString();
					});

					res.on("end", () => {
						if (res.statusCode === 301 || res.statusCode === 302) {
							const location = res.headers.location;
							fetchTitleWithPromise(location as string).then((resp) => {
								resolve(resp);
							});
						} else {
							resolve({
								title: title.split("<title>")[1].split("</title>")[0],
								address: address,
							});
						}
					});

					res.on("error", (err) => {
						resolve({
							title: title,
							address: address,
						});
					});
				});
			} catch (err) {
				resolve({
					title: "NO RESPONSE",
					address: address,
				});
			}
		});
	}
};
