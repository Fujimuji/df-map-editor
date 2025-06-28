// src/lib/parser-logic/parser/MapParserService.ts

// Notice the 'fs' import is now gone.
import { RawMapData } from './models/RawMapData';
import { Vector3D } from './models/Vector3D';
import { MalformedDataPlaceholder } from './models/MalformedDataPlaceholder';
import { RadiusVAGoBackData } from './models/RadiusVAGoBackData';
import { CheckpointMissionData } from './models/CheckpointMissionData';
import { AbilityCountData } from './models/AbilityCountData';
import { HiddenCpTtData } from './models/HiddenCpTtData';
import { EffectInstanceData } from './models/EffectInstanceData';
import { EffectBounceData } from './models/EffectBounceData';

export class MapParserService {
	// The 'parse' method now accepts the file content directly as a string.
	public parse(fileContent: string): RawMapData {
		const rawData = new RawMapData();

		// The file system logic has been removed.

		const globalVarRegex = /Global\.([a-zA-Z0-9_]+)\s*=\s*Array\((.*?)\);/gs;

		let match;
		while ((match = globalVarRegex.exec(fileContent)) !== null) {
			const variableName = match[1];
			const arrayContent = match[2].trim();

			// This debug log is still helpful for now.
			console.log(`Found Global variable: "${variableName}"`);

			switch (variableName) {
				case 'CPposition':
					rawData.CPposition = this.parseVector3DList(arrayContent, Vector3D.tryParse);
					break;
				case 'Radius_VA_GoBackCP':
					rawData.Radius_VA_GoBackCP = this.parseVector3DList(
						arrayContent,
						RadiusVAGoBackData.tryParse
					);
					break;
				case 'Connections':
					rawData.Connections = this.parseNumberOrBoolList(arrayContent);
					break;
				case 'Prime':
					rawData.Prime = this.parseNumberOrBoolList(arrayContent);
					break;
				case 'Mission':
					rawData.Mission = this.parseMissionList(arrayContent);
					break;
				case 'AbilityCount':
					rawData.AbilityCount = this.parseAbilityCountList(arrayContent);
					break;
				case 'HiddenCP_TpRad_TT':
					rawData.HiddenCP_TpRad_TT = this.parseHiddenCpTtList(arrayContent);
					break;
				case 'TP':
					rawData.TP = this.parseTeleportList(arrayContent);
					break;
				case 'Effect':
					rawData.Effect = this.parseEffectList(arrayContent);
					break;
				case 'FakeUpperCP':
					rawData.FakeUpperCP = this.parseBooleanList(arrayContent);
					break;
				default:
					console.warn(`Warning: Unhandled global variable encountered: ${variableName}`);
					break;
			}
		}
		return rawData;
	}

	// ALL THE PRIVATE HELPER METHODS BELOW THIS LINE REMAIN EXACTLY THE SAME.
	// ... (the full code for all the private parse... methods is identical to before)
	// --- PRIVATE PARSING HELPER METHODS ---

	private parseVector3DList<T>(
		content: string,
		tryParseFn: (s: string) => T | null
	): (T | MalformedDataPlaceholder)[] {
		const elements = this.splitArrayElements(content);
		const results: (T | MalformedDataPlaceholder)[] = [];
		for (const elText of elements) {
			const parsed = tryParseFn(elText);
			if (parsed) {
				results.push(parsed);
			} else {
				results.push(new MalformedDataPlaceholder(elText, 'Invalid Vector-like format'));
			}
		}
		return results;
	}

	private parseNumberOrBoolList(content: string): (number | boolean)[] {
		return this.splitArrayElements(content).map((el) => {
			if (el.toLowerCase() === 'true') return true;
			if (el.toLowerCase() === 'false') return false;
			return parseFloat(el);
		});
	}

	private parseBooleanList(content: string): boolean[] {
		return this.splitArrayElements(content).map((el) => el.toLowerCase() === 'true');
	}

	private parseMissionList(
		content: string
	): (CheckpointMissionData | boolean | MalformedDataPlaceholder)[] {
		return this.splitArrayElements(content).map((el) => {
			if (el.toLowerCase() === 'true') return true;
			if (el.toLowerCase() === 'false') return false;
			if (el.startsWith('Array(')) {
				const mission = new CheckpointMissionData();
				const innerContent = el.substring(6, el.length - 1);
				const parts = innerContent.split(',').map((p) => p.trim());
				mission.MissionPrimeProduct = parseInt(parts[0], 10);
				mission.MissionValues = parts.slice(1).map((p) => parseFloat(p));
				return mission;
			}
			return new MalformedDataPlaceholder(el, 'Invalid Mission format');
		});
	}

	private parseAbilityCountList(
		content: string
	): (AbilityCountData | boolean | number | MalformedDataPlaceholder)[] {
		return this.splitArrayElements(content).map((el) => {
			if (el.toLowerCase() === 'false') return false;
			if (el === '0') return 0;
			if (el.startsWith('Array(')) {
				const innerContent = el.substring(6, el.length - 1);
				const parts = this.splitArrayElements(innerContent);
				if (
					parts.length === 2 &&
					parts[0].toLowerCase() === 'true' &&
					parts[1].startsWith('Vector(')
				) {
					const vectorContent = parts[1].substring(7, parts[1].length - 1);
					const states = vectorContent.split(',').map((p) => parseInt(p.trim(), 10));
					return new AbilityCountData(states[0], states[1], states[2]);
				}
			}
			return new MalformedDataPlaceholder(el, 'Invalid AbilityCount format');
		});
	}

	private parseHiddenCpTtList(
		content: string
	): (HiddenCpTtData | boolean | MalformedDataPlaceholder)[] {
		return this.splitArrayElements(content).map((el) => {
			if (el.toLowerCase() === 'false') return false;
			const parsed = HiddenCpTtData.tryParse(el);
			return parsed ? parsed : new MalformedDataPlaceholder(el, 'Invalid HiddenCpTtData format');
		});
	}

	private parseTeleportList(
		content: string
	): (Vector3D | boolean | number | MalformedDataPlaceholder)[] {
		return this.splitArrayElements(content).map((el) => {
			if (el.toLowerCase() === 'false') return false;
			if (el === '0') return 0;
			const parsed = Vector3D.tryParse(el);
			return parsed ? parsed : new MalformedDataPlaceholder(el, 'Invalid TP format');
		});
	}

	private parseEffectList(
		content: string
	): (EffectInstanceData[] | boolean | number | MalformedDataPlaceholder)[] {
		return this.splitArrayElements(content).map((el) => {
			if (el.toLowerCase() === 'false') return false;
			if (el === '0') return 0;
			if (el.startsWith('Array(')) {
				const innerContent = el.substring(6, el.length - 1);
				if (innerContent.trim() === '') return []; // Empty effect array
				return this.splitArrayElements(innerContent)
					.map((effectStr) => this.parseSingleEffectInstance(effectStr))
					.filter((e): e is EffectInstanceData => e instanceof EffectInstanceData);
			}
			return new MalformedDataPlaceholder(el, 'Invalid Effect format');
		});
	}

	private parseSingleEffectInstance(
		effectStr: string
	): EffectInstanceData | MalformedDataPlaceholder {
		if (!effectStr.startsWith('Array('))
			return new MalformedDataPlaceholder(effectStr, 'Effect instance is not an array');

		const parts = this.splitArrayElements(effectStr.substring(6, effectStr.length - 1));
		if (parts.length !== 4)
			return new MalformedDataPlaceholder(
				effectStr,
				'Effect instance has incorrect number of parts'
			);

		const position = Vector3D.tryParse(parts[0]);
		const radius = parseFloat(parts[1]);
		const status = parseInt(parts[2], 10);
		let value: any;

		if (!position || isNaN(radius) || isNaN(status)) {
			return new MalformedDataPlaceholder(
				effectStr,
				'Malformed position, radius, or status in effect'
			);
		}

		const valueText = parts[3];
		if (status === 11 && valueText.startsWith('Array(')) {
			// Bounce effect
			const bounceParts = this.splitArrayElements(valueText.substring(6, valueText.length - 1));
			const direction = Vector3D.tryParse(bounceParts[0]);
			const power = parseFloat(bounceParts[1]);
			if (direction && !isNaN(power)) {
				value = new EffectBounceData(direction, power);
			}
		} else {
			value = parseFloat(valueText); // Most other values are numbers
		}

		if (value === undefined)
			return new MalformedDataPlaceholder(effectStr, 'Could not determine effect value');

		return new EffectInstanceData(position, radius, status, value);
	}

	private splitArrayElements(arrayContent: string): string[] {
		const elements: string[] = [];
		if (!arrayContent || arrayContent.trim() === '') return elements;
		let parenDepth = 0;
		let lastSplit = 0;
		for (let i = 0; i < arrayContent.length; i++) {
			const char = arrayContent[i];
			if (char === '(') parenDepth++;
			else if (char === ')') parenDepth--;
			else if (char === ',' && parenDepth === 0) {
				elements.push(arrayContent.substring(lastSplit, i).trim());
				lastSplit = i + 1;
			}
		}
		elements.push(arrayContent.substring(lastSplit).trim());
		return elements.filter((s) => s);
	}
}
