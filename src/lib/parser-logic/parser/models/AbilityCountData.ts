export class AbilityCountData {
	public IsActive: boolean = true;
	public Ability1State: number;
	public Ability2State: number;
	public Ability3State: number;

	constructor(state1: number, state2: number, state3: number) {
		this.Ability1State = state1;
		this.Ability2State = state2;
		this.Ability3State = state3;
	}

	public toString(): string {
		return `Array(${this.IsActive ? 'True' : 'False'}, Vector(${this.Ability1State}, ${this.Ability2State}, ${this.Ability3State}))`;
	}
}
