import { Vector3D } from './Vector3D';
import { EffectBounceData } from './EffectBounceData';

export class EffectInstanceData {
	public Position: Vector3D;
	public Radius: number;
	public Status: number;
	public Value: number | EffectBounceData | any;

	constructor(position: Vector3D, radius: number, status: number, value: any) {
		this.Position = position;
		this.Radius = radius;
		this.Status = status;
		this.Value = value;
	}

	public toString(): string {
		const posString = this.Position ? this.Position.toString() : 'null';
		let valString = 'null';

		if (this.Value instanceof EffectBounceData) {
			valString = this.Value.toString();
		} else if (typeof this.Value === 'number') {
			valString = this.Value % 1 === 0 ? this.Value.toString() : this.Value.toFixed(3);
		} else if (this.Value) {
			valString = this.Value.toString();
		}

		return `Array(${posString}, ${this.Radius.toFixed(3)}, ${this.Status}, ${valString})`;
	}
}
