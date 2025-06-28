import { Checkpoint } from './Checkpoint';
import { Level } from './Level';

export class Map {
	// Checkpoint 0 is the only one we need to track separately.
	public Spawn: Checkpoint;

	// The levels contain all other checkpoints. No AllCheckpoints array needed.
	public Levels: Level[] = [];

	constructor(spawnCheckpoint: Checkpoint) {
		this.Spawn = spawnCheckpoint;
	}
}
