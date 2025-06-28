import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { Map } from './parser-logic/core/models/Map';
import { Vector3D } from './parser-logic/parser/models/Vector3D';
import { EffectInstanceData } from './parser-logic/parser/models/EffectInstanceData';
import { EffectBounceData } from './parser-logic/parser/models/EffectBounceData';
import { RadiusVAGoBackData } from './parser-logic/parser/models/RadiusVAGoBackData';
import { CheckpointMissionData } from './parser-logic/parser/models/CheckpointMissionData';
import { AbilityCountData } from './parser-logic/parser/models/AbilityCountData';
import { HiddenCpTtData } from './parser-logic/parser/models/HiddenCpTtData';

// Serialization helpers
function serializeVector3D(vector: Vector3D): any {
	return {
		__type: 'Vector3D',
		X: vector.X,
		Y: vector.Y,
		Z: vector.Z
	};
}

function deserializeVector3D(data: any): Vector3D {
	return new Vector3D(data.X, data.Y, data.Z);
}

function serializeEffectBounceData(bounceData: EffectBounceData): any {
	return {
		__type: 'EffectBounceData',
		Direction: serializeVector3D(bounceData.Direction),
		Power: bounceData.Power
	};
}

function deserializeEffectBounceData(data: any): EffectBounceData {
	return new EffectBounceData(deserializeVector3D(data.Direction), data.Power);
}

function serializeRadiusVAGoBackData(data: RadiusVAGoBackData): any {
	return {
		__type: 'RadiusVAGoBackData',
		Radius: data.Radius,
		ViewAngle: data.ViewAngle,
		GoBackIndex: data.GoBackIndex
	};
}

function deserializeRadiusVAGoBackData(data: any): RadiusVAGoBackData {
	return new RadiusVAGoBackData(data.Radius, data.ViewAngle, data.GoBackIndex);
}

function serializeCheckpointMissionData(data: CheckpointMissionData): any {
	return {
		__type: 'CheckpointMissionData',
		MissionPrimeProduct: data.MissionPrimeProduct,
		MissionValues: data.MissionValues
	};
}

function deserializeCheckpointMissionData(data: any): CheckpointMissionData {
	const missionData = new CheckpointMissionData();
	missionData.MissionPrimeProduct = data.MissionPrimeProduct;
	missionData.MissionValues = data.MissionValues;
	return missionData;
}

function serializeAbilityCountData(data: AbilityCountData): any {
	return {
		__type: 'AbilityCountData',
		IsActive: data.IsActive,
		Ability1State: data.Ability1State,
		Ability2State: data.Ability2State,
		Ability3State: data.Ability3State
	};
}

function deserializeAbilityCountData(data: any): AbilityCountData {
	return new AbilityCountData(data.Ability1State, data.Ability2State, data.Ability3State);
}

function serializeHiddenCpTtData(data: HiddenCpTtData): any {
	return {
		__type: 'HiddenCpTtData',
		TargetCpIndex: data.TargetCpIndex,
		TeleportRadius: data.TeleportRadius,
		TimeTrialValue: data.TimeTrialValue
	};
}

function deserializeHiddenCpTtData(data: any): HiddenCpTtData {
	return new HiddenCpTtData(data.TargetCpIndex, data.TeleportRadius, data.TimeTrialValue);
}

function serializeEffectInstanceData(effect: EffectInstanceData): any {
	return {
		__type: 'EffectInstanceData',
		Position: effect.Position ? serializeVector3D(effect.Position) : null,
		Radius: effect.Radius,
		Status: effect.Status,
		Value: effect.Value instanceof EffectBounceData ? serializeEffectBounceData(effect.Value) : effect.Value
	};
}

function deserializeEffectInstanceData(data: any): EffectInstanceData {
	const position = data.Position ? deserializeVector3D(data.Position) : new Vector3D(0, 0, 0);
	const value = data.Value && data.Value.__type === 'EffectBounceData' 
		? deserializeEffectBounceData(data.Value) 
		: data.Value;
	
	return new EffectInstanceData(position, data.Radius, data.Status, value);
}

function serializeCheckpoint(checkpoint: any): any {
	const serialized: any = {
		Index: checkpoint.Index,
		Position: checkpoint.Position ? serializeVector3D(checkpoint.Position) : null,
		RadiusVAGoBack: checkpoint.RadiusVAGoBack instanceof RadiusVAGoBackData 
			? serializeRadiusVAGoBackData(checkpoint.RadiusVAGoBack) 
			: checkpoint.RadiusVAGoBack,
		Connection: checkpoint.Connection,
		Mission: checkpoint.Mission instanceof CheckpointMissionData 
			? serializeCheckpointMissionData(checkpoint.Mission) 
			: checkpoint.Mission,
		Prime: checkpoint.Prime,
		AbilityCount: checkpoint.AbilityCount instanceof AbilityCountData 
			? serializeAbilityCountData(checkpoint.AbilityCount) 
			: checkpoint.AbilityCount,
		HiddenCpTt: checkpoint.HiddenCpTt instanceof HiddenCpTtData 
			? serializeHiddenCpTtData(checkpoint.HiddenCpTt) 
			: checkpoint.HiddenCpTt,
		Teleport: checkpoint.Teleport instanceof Vector3D ? serializeVector3D(checkpoint.Teleport) : checkpoint.Teleport,
		Effects: checkpoint.Effects.map((effect: EffectInstanceData) => serializeEffectInstanceData(effect)),
		IsFakeUpperCP: checkpoint.IsFakeUpperCP
	};
	return serialized;
}

function deserializeCheckpoint(data: any): any {
	const checkpoint: any = {
		Index: data.Index,
		Position: data.Position ? deserializeVector3D(data.Position) : null,
		RadiusVAGoBack: data.RadiusVAGoBack && data.RadiusVAGoBack.__type === 'RadiusVAGoBackData' 
			? deserializeRadiusVAGoBackData(data.RadiusVAGoBack) 
			: data.RadiusVAGoBack,
		Connection: data.Connection,
		Mission: data.Mission && data.Mission.__type === 'CheckpointMissionData' 
			? deserializeCheckpointMissionData(data.Mission) 
			: data.Mission,
		Prime: data.Prime,
		AbilityCount: data.AbilityCount && data.AbilityCount.__type === 'AbilityCountData' 
			? deserializeAbilityCountData(data.AbilityCount) 
			: data.AbilityCount,
		HiddenCpTt: data.HiddenCpTt && data.HiddenCpTt.__type === 'HiddenCpTtData' 
			? deserializeHiddenCpTtData(data.HiddenCpTt) 
			: data.HiddenCpTt,
		Teleport: data.Teleport && data.Teleport.__type === 'Vector3D' ? deserializeVector3D(data.Teleport) : data.Teleport,
		Effects: data.Effects.map((effectData: any) => deserializeEffectInstanceData(effectData)),
		IsFakeUpperCP: data.IsFakeUpperCP
	};
	return checkpoint;
}

function serializeMap(map: Map): any {
	return {
		Spawn: serializeCheckpoint(map.Spawn),
		Levels: map.Levels.map(level => ({
			...level,
			Checkpoints: level.Checkpoints.map(checkpoint => serializeCheckpoint(checkpoint))
		}))
	};
}

function deserializeMap(data: any): Map {
	// Create a new Map instance
	const map = new Map(deserializeCheckpoint(data.Spawn));
	
	// Reconstruct levels and their checkpoints
	map.Levels = data.Levels.map((levelData: any) => ({
		...levelData,
		Checkpoints: levelData.Checkpoints.map((checkpointData: any) => deserializeCheckpoint(checkpointData))
	}));
	
	return map;
}

function getInitialMap(): Map | null {
	if (!browser) return null;

	const savedMapJson = localStorage.getItem('savedMap');
	if (savedMapJson) {
		try {
			const parsedData = JSON.parse(savedMapJson);
			return deserializeMap(parsedData);
		} catch (e) {
			console.error('Failed to parse saved map from localStorage', e);
			return null;
		}
	}
	return null;
}

const mapStore = writable<Map | null>(getInitialMap());

mapStore.subscribe((currentMap) => {
	if (browser) {
		if (currentMap) {
			const serializedMap = serializeMap(currentMap);
			localStorage.setItem('savedMap', JSON.stringify(serializedMap));
		} else {
			localStorage.removeItem('savedMap');
		}
	}
});

export default mapStore;
