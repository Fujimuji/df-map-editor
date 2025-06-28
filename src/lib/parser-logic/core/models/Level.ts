import { Checkpoint } from './Checkpoint';

export class Level {
	public id: number = 0;
	public Checkpoints: Checkpoint[] = [];

	constructor(id: number, initialCheckpoints: Checkpoint[] = []) {
		this.id = id;
		this.Checkpoints = initialCheckpoints;
	}

	public get StartIndex(): number | null {
		if (this.Checkpoints.length > 0) {
			return this.Checkpoints[0].Index;
		}
		return null;
	}
}
