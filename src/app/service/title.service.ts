import FETCH_UTILS from "../../utils/fetchTitle.util";
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
				FETCH_UTILS.fetchTitleUtil(a, (err, resp) => {
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
					FETCH_UTILS.fetchTitleUtil(address, (err, resp) => {
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
				const promises = addresses.map((a) =>
					FETCH_UTILS.fetchTitleWithPromise(a),
				);

				resolve(Promise.all(promises));
			});
		},
	};
};
