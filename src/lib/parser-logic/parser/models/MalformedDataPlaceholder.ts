export class MalformedDataPlaceholder {
	public RawData: string;
	public Error: string;

	constructor(rawData: string, error: string) {
		this.RawData = rawData;
		this.Error = error;
	}

	public toString(): string {
		return `[Malformed: ${this.Error} - Data: "${this.RawData}"]`;
	}
}
