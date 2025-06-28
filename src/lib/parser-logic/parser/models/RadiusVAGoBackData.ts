export class RadiusVAGoBackData {
	public Radius: number;
	public ViewAngle: number;
	public GoBackIndex: number;

	constructor(radius: number, viewAngle: number, goBackIndex: number) {
		this.Radius = radius;
		this.ViewAngle = viewAngle;
		this.GoBackIndex = goBackIndex;
	}

	public toString(): string {
		const formatNumber = (num: number) => (num % 1 === 0 ? num.toString() : num.toFixed(3));

		return `Vector(${formatNumber(this.Radius)}, ${formatNumber(this.ViewAngle)}, ${this.GoBackIndex})`;
	}

	public static tryParse(s: string): RadiusVAGoBackData | null {
		if (!s || !s.trim().startsWith('Vector(') || !s.trim().endsWith(')')) {
			return null;
		}

		const content = s.substring(s.indexOf('(') + 1, s.lastIndexOf(')'));
		const parts = content.split(',');

		if (parts.length === 3) {
			const radius = parseFloat(parts[0].trim());
			const viewAngle = parseFloat(parts[1].trim());
			const goBackIndex = parseInt(parts[2].trim(), 10);

			if (!isNaN(radius) && !isNaN(viewAngle) && !isNaN(goBackIndex)) {
				return new RadiusVAGoBackData(radius, viewAngle, goBackIndex);
			}
		}

		return null;
	}
}
