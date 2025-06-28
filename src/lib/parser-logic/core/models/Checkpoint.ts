// src/core/models/Checkpoint.ts

import { Vector3D } from '../../parser/models/Vector3D';
import { RadiusVAGoBackData } from '../../parser/models/RadiusVAGoBackData';
import { CheckpointMissionData } from '../../parser/models/CheckpointMissionData';
import { AbilityCountData } from '../../parser/models/AbilityCountData';
import { HiddenCpTtData } from '../../parser/models/HiddenCpTtData';
import { EffectInstanceData } from '../../parser/models/EffectInstanceData';

// These type aliases correctly define all the possible data types for each property.
type MissionType = boolean | CheckpointMissionData | null;
type AbilityCountType = boolean | number | AbilityCountData | null;
type HiddenCpDataType = boolean | HiddenCpTtData | null; // Renamed for clarity
type TeleportType = boolean | number | Vector3D | null;

export class Checkpoint {
	public Index: number;
	public Position: Vector3D | null = null;

	// Correct: This holds the data object, which contains the GoBackIndex as a simple number.
	public RadiusVAGoBack: RadiusVAGoBackData | null = null;

	// Correct: This stores the connection as a raw number or boolean, not an object reference.
	public Connection: boolean | number | null = null;

	public Mission: MissionType = null;
	public Prime: boolean | number | null = null;
	public AbilityCount: AbilityCountType = null;

	// Correct: This holds the data for this checkpoint without linking to another.
	public HiddenCpTt: HiddenCpDataType = null;

	public Teleport: TeleportType = null;
	public Effects: EffectInstanceData[] = [];
	public IsFakeUpperCP: boolean = false;

	constructor(index: number) {
		this.Index = index;
	}
}
