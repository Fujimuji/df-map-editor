import { Map } from '../core/models/Map';
import { RawMapData } from './models/RawMapData';

export class MapExporterService {
	public exportToString(map: Map): string {
		const rawData = new RawMapData();
		const allCheckpoints = [map.Spawn, ...map.Levels.flatMap((l) => l.Checkpoints)];

		for (let i = 0; i < allCheckpoints.length; i++) {
			const checkpoint = allCheckpoints[i];

			// Push existing data (this part is the same)
			rawData.CPposition.push(checkpoint.Position);
			rawData.Prime.push(checkpoint.Prime);
			rawData.Mission.push(checkpoint.Mission);
			rawData.AbilityCount.push(checkpoint.AbilityCount);
			rawData.HiddenCP_TpRad_TT.push(checkpoint.HiddenCpTt);
			rawData.TP.push(checkpoint.Teleport);
			rawData.Effect.push(checkpoint.Effects);
			rawData.FakeUpperCP.push(checkpoint.IsFakeUpperCP);

			// --- RE-CALCULATION LOGIC WITH YOUR NEW RULE ---

			// Connections
			if (i === 0) {
				// FINAL RULE: The connection for the spawn checkpoint (index 0) is always 0.
				rawData.Connections.push(0);
			} else {
				const parentLevel = map.Levels.find(
					(l) =>
						l.Checkpoints[0] === checkpoint ||
						(l.Checkpoints.includes(checkpoint) &&
							l.Checkpoints[l.Checkpoints.length - 1] === checkpoint)
				);
				const isLastCheckpointOfLevel = parentLevel
					? parentLevel.Checkpoints[parentLevel.Checkpoints.length - 1] === checkpoint
					: false;

				if (isLastCheckpointOfLevel && i !== allCheckpoints.length - 1) {
					rawData.Connections.push(false);
				} else if (i === allCheckpoints.length - 1) {
					rawData.Connections.push(false);
				} else {
					rawData.Connections.push(i + 1);
				}
			}

			// GoBackIndex with your new rule
			if (checkpoint.RadiusVAGoBack) {
				const isStartOfLevel = map.Levels.some((level) => level.Checkpoints[0] === checkpoint);

				if (i === 0) {
					// Rule for the main spawn point
					checkpoint.RadiusVAGoBack.GoBackIndex = -1;
				} else if (isStartOfLevel) {
					// NEW RULE: If it's the start of a level, GoBackIndex is 0 (go to spawn).
					checkpoint.RadiusVAGoBack.GoBackIndex = 0;
				} else {
					// Default Rule: Go back to the previous checkpoint in the list.
					checkpoint.RadiusVAGoBack.GoBackIndex = i - 1;
				}
				rawData.Radius_VA_GoBackCP.push(checkpoint.RadiusVAGoBack);
			} else {
				rawData.Radius_VA_GoBackCP.push(null);
			}
		}

		const variablesBlock = `variables
{
	global:
		0: CPposition
		1: Radius_VA_GoBackCP
		2: Connections
		3: Mission
		4: Prime
		5: AbilityCount
		6: HiddenCP_TpRad_TT
		7: TP
		8: Effect
		9: FakeUpperCP
}`;

		// === Step 3: Generate the data string for the 'actions' block ===
		let dataString = '';
		const orderedKeys: (keyof RawMapData)[] = [
			'CPposition',
			'Radius_VA_GoBackCP',
			'Connections',
			'Mission',
			'Prime',
			'AbilityCount',
			'HiddenCP_TpRad_TT',
			'TP',
			'Effect',
			'FakeUpperCP'
		];

		for (const key of orderedKeys) {
			const arr = rawData[key as keyof RawMapData];
			if (arr) {
				const arrayContent = (arr as any[])
					.map((item) => {
						if (item === null) return 'False';
						if (typeof item === 'boolean') return item ? 'True' : 'False';
						if (key === 'Effect' && Array.isArray(item) && item.length === 0) return 'False';
						if (key === 'Effect' && Array.isArray(item) && item.length > 0) {
							const effectStrings = item.map((effect) => effect.toString()).join(', ');
							return `Array(${effectStrings})`;
						}
						return item.toString();
					})
					.join(', ');

				// Add indentation for placement inside the actions block
				dataString += `\tGlobal.${key} = Array(${arrayContent});\n`;
			}
		}

		// === Step 4: Combine everything into the final format ===
		const finalOutput = `${variablesBlock}\n\nactions\n{\n${dataString.trimEnd()}\n}`;

		return finalOutput;
	}
}
