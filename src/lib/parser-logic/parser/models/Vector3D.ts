export class Vector3D {
	public X: number;
	public Y: number;
	public Z: number;

	constructor(x: number, y: number, z: number) {
		this.X = x;
		this.Y = y;
		this.Z = z;
	}

	public toString(): string {
		return `Vector(${this.X.toFixed(3)}, ${this.Y.toFixed(3)}, ${this.Z.toFixed(3)})`;
	}

	public static tryParse(s: string): Vector3D | null {
		if (!s || !s.trim().startsWith('Vector(') || !s.trim().endsWith(')')) {
			return null;
		}

		const content = s.substring(s.indexOf('(') + 1, s.lastIndexOf(')'));
		const parts = content.split(',');

		if (parts.length === 3) {
			const x = parseFloat(parts[0].trim());
			const y = parseFloat(parts[1].trim());
			const z = parseFloat(parts[2].trim());

			if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
				return new Vector3D(x, y, z);
			}
		}

		return null;
	}
}
