import { Vector3D } from './Vector3D';

export class EffectBounceData {
	public Direction: Vector3D;
	public Power: number;

	constructor(direction: Vector3D, power: number) {
		this.Direction = direction;
		this.Power = power;
	}

	public toString(): string {
		const dirString = this.Direction ? this.Direction.toString() : 'null';
		return `Array(${dirString}, ${this.Power.toFixed(3)})`;
	}
}
