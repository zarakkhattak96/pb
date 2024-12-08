import type { RESULT } from "../app/service/title.service";
import httpClient from "../infra/client/httpClient";
import { CALLBACK_TYPE } from "./types";

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
					console.error(err, "ERRRRRRR");

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

const FETCH_UTILS = { fetchTitleUtil, fetchTitleWithPromise };

export default FETCH_UTILS;
