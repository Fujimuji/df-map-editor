// src/parser/MapComposer.ts

import { Map } from '../core/models/Map';
import { Level } from '../core/models/Level';
import { Checkpoint } from '../core/models/Checkpoint';
import { RawMapData } from './models/RawMapData';
import { MalformedDataPlaceholder } from './models/MalformedDataPlaceholder';
import { Vector3D } from './models/Vector3D';
import { RadiusVAGoBackData } from './models/RadiusVAGoBackData';

export class MapComposer {
	public compose(rawData: RawMapData): Map | null {
		if (!rawData || rawData.CPposition.length === 0) {
			console.error('Cannot compose map: Raw data is empty or contains no checkpoints.');
			return null;
		}

		// === Pass 1: Create all Checkpoint object containers ===
		const allCheckpoints: Checkpoint[] = [];
		for (let i = 0; i < rawData.CPposition.length; i++) {
			allCheckpoints.push(new Checkpoint(i));
		}

		// === Pass 2: Populate all checkpoint data ===
		for (let i = 0; i < allCheckpoints.length; i++) {
			const checkpoint = allCheckpoints[i];

			// Populate all data for the current checkpoint from the rawData arrays.
			const pos = rawData.CPposition[i];
			if (pos instanceof Vector3D) checkpoint.Position = pos;

			const rad = rawData.Radius_VA_GoBackCP[i];
			if (rad instanceof RadiusVAGoBackData) checkpoint.RadiusVAGoBack = rad;

			checkpoint.Connection = rawData.Connections[i];
			checkpoint.Prime = rawData.Prime[i];

			const mission = rawData.Mission[i];
			if (!(mission instanceof MalformedDataPlaceholder)) checkpoint.Mission = mission;

			const ability = rawData.AbilityCount[i];
			if (!(ability instanceof MalformedDataPlaceholder)) checkpoint.AbilityCount = ability;

			const hidden = rawData.HiddenCP_TpRad_TT[i];
			if (!(hidden instanceof MalformedDataPlaceholder)) checkpoint.HiddenCpTt = hidden;

			const tp = rawData.TP[i];
			if (!(tp instanceof MalformedDataPlaceholder)) checkpoint.Teleport = tp;

			const effect = rawData.Effect[i];
			if (Array.isArray(effect)) checkpoint.Effects = effect;

			checkpoint.IsFakeUpperCP = rawData.FakeUpperCP[i];
		}

		console.log('\n--- DEBUG: Prime values ---');
		console.log(allCheckpoints.map((cp) => cp.Prime));
		// --- END OF DEBUG LOG ---

		// === Pass 3: Identify Spawn and build the Map object ===
		const spawnCheckpoint = allCheckpoints.find(
			(cp) => typeof cp.Prime === 'number' && cp.Prime % 11 === 0
		);

		if (!spawnCheckpoint) {
			console.warn(
				'Warning: No spawn point (Prime % 11 === 0) found. Using Checkpoint 0 as default.'
			);
			// Default to Checkpoint 0 if no explicit spawn is found.
			const map = new Map(allCheckpoints[0]);
			return map;
		}

		const map = new Map(spawnCheckpoint);

		// === Pass 4: Build Levels ===
		let currentLevel: Level | null = null;
		let levelCounter = 1;
		for (const checkpoint of allCheckpoints) {
			// Checkpoints that are spawn points cannot also start a new level.
			if (typeof checkpoint.Prime === 'number' && checkpoint.Prime % 11 === 0) {
				continue; // Skip spawn points from level logic
			}

			// If the prime is divisible by 13, it's a new level.
			if (typeof checkpoint.Prime === 'number' && checkpoint.Prime % 13 === 0) {
				const newLevel = new Level(levelCounter++, [checkpoint]);
				currentLevel = newLevel;
				map.Levels.push(newLevel);
			} else if (currentLevel) {
				// Otherwise, add it to the current level.
				currentLevel.Checkpoints.push(checkpoint);
			}
		}

		console.log(
			`Composer Complete: Found spawn at index ${spawnCheckpoint.Index}. Composed ${allCheckpoints.length} checkpoints into ${map.Levels.length} levels.`
		);
		return map;
	}
}
