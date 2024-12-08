import https from "node:https";
import http from "node:http";

const httpClient = (address: string) => {
	return address.includes("https://") ? https : http;
};

export default httpClient;
