import { Vector3D } from './Vector3D';
import { RadiusVAGoBackData } from './RadiusVAGoBackData';
import { CheckpointMissionData } from './CheckpointMissionData';
import { AbilityCountData } from './AbilityCountData';
import { HiddenCpTtData } from './HiddenCpTtData';
import { EffectInstanceData } from './EffectInstanceData';
import { MalformedDataPlaceholder } from './MalformedDataPlaceholder';

type ParsedItem<T> = T | MalformedDataPlaceholder | null;

export class RawMapData {
	public CPposition: ParsedItem<Vector3D>[] = [];
	public Radius_VA_GoBackCP: ParsedItem<RadiusVAGoBackData>[] = [];

	// --- THESE TWO LINES ARE NOW CORRECTED ---
	public Connections: (boolean | number | null)[] = [];
	public Prime: (boolean | number | null)[] = [];

	public Mission: ParsedItem<CheckpointMissionData | boolean>[] = [];
	public AbilityCount: ParsedItem<AbilityCountData | boolean | number>[] = [];
	public HiddenCP_TpRad_TT: ParsedItem<HiddenCpTtData | boolean>[] = [];
	public TP: ParsedItem<Vector3D | boolean | number>[] = [];
	public Effect: ParsedItem<EffectInstanceData[] | boolean | number>[] = [];

	public FakeUpperCP: boolean[] = [];

	constructor() {}
}
