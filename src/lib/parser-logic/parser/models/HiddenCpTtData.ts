// src/parser/models/HiddenCpTtData.ts

export class HiddenCpTtData {
	public TargetCpIndex: number;
	public TeleportRadius: number;
	public TimeTrialValue: number;

	constructor(targetCpIndex: number, teleportRadius: number, timeTrialValue: number) {
		this.TargetCpIndex = targetCpIndex;
		this.TeleportRadius = teleportRadius;
		this.TimeTrialValue = timeTrialValue;
	}

	public toString(): string {
		const formatNumber = (num: number) => (num % 1 === 0 ? num.toString() : num.toFixed(3));
		return `Vector(${this.TargetCpIndex}, ${formatNumber(this.TeleportRadius)}, ${formatNumber(this.TimeTrialValue)})`;
	}

	public static tryParse(s: string): HiddenCpTtData | null {
		if (!s || !s.trim().startsWith('Vector(') || !s.trim().endsWith(')')) {
			return null;
		}

		const content = s.substring(s.indexOf('(') + 1, s.lastIndexOf(')'));
		const parts = content.split(',');

		if (parts.length === 3) {
			// Parse the three numeric values from the string parts
			const targetIndex = parseInt(parts[0].trim(), 10);
			const radius = parseFloat(parts[1].trim());
			const ttValue = parseFloat(parts[2].trim());

			// Check if all parts were parsed successfully
			if (!isNaN(targetIndex) && !isNaN(radius) && !isNaN(ttValue)) {
				return new HiddenCpTtData(targetIndex, radius, ttValue);
			}
		}
		return null;
	}
}
