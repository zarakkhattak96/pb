export type CALLBACK = (
	error: Error | null,
	resp: { title: string; address: string }[],
) => void;

export enum CALLBACK_TYPE {
	data = "data",
	end = "end",
	close = "close",
	error = "error",
}
