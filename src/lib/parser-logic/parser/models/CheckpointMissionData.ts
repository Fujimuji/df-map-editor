export class CheckpointMissionData {
	public MissionPrimeProduct: number;
	public MissionValues: number[];

	constructor() {
		this.MissionPrimeProduct = 0;
		this.MissionValues = [];
	}

	public toString(): string {
		let valueString = '';
		for (const val of this.MissionValues) {
			if (val === 9930 || val % 1 === 0) {
				valueString += `, ${val}`;
			} else {
				valueString += `, ${val.toFixed(3)}`;
			}
		}

		return `Array(${this.MissionPrimeProduct}${valueString})`;
	}
}
