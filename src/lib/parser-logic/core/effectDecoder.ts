import type { EffectInstanceData } from '../parser/models/EffectInstanceData';
import type { Vector3D } from '../parser/models/Vector3D';

// --- DATA MAPS FROM THE PDFS ---

const effectStatusMap: Record<number, string> = {
	0: 'Time Effect',
	1: 'Death Effect',
	2: 'Ability Effect',
	3: 'Permeation Effect',
	4: 'Checkpoint Effect',
	5: 'Entry Portal',
	6: 'Exit Portal',
	7: 'Blackhole Effect',
	8: 'Zipline Start',
	9: 'Zipline End',
	10: 'Shootable Orb Effect',
	11: 'Bounce Effect'
};

// --- We now have specific prime maps for each effect type that needs one ---

const abilityEffectPrimeMap: Record<number, string> = {
	2: 'Punch Disabled',
	3: 'Uppercut Disabled',
	5: 'Slam Disabled',
	7: 'Force Stall',
	11: 'No Change to Abilities',
	29: 'Empowered Punch'
};

const permeationEffectPrimeMap: Record<number, string> = {
	2: 'Punch Disabled',
	3: 'Uppercut Disabled',
	5: 'Slam Disabled',
	11: 'No Change to Abilities',
	29: 'Empowered Punch',
	31: 'Collision not changed'
};

const checkpointEffectPrimeMap: Record<number, string> = {
	2: 'Punch Disabled',
	3: 'Uppercut Disabled',
	5: 'Slam Disabled',
	7: 'Centerless',
	11: 'No Change to Abilities',
	29: 'Empowered Punch'
};

const portalAndOrbPrimeMap: Record<number, string> = {
	2: 'Punch Disabled',
	3: 'Uppercut Disabled',
	5: 'Slam Disabled',
	11: 'No Change to Abilities',
	29: 'Empowered Punch'
};

// --- DECODER HELPER FUNCTION ---

function decodePrimes(
	product: number | boolean | null,
	primeMap: Record<number, string>
): string[] {
	if (typeof product !== 'number' || product <= 1) return [];
	const attributes: string[] = [];
	for (const prime in primeMap) {
		if (product % Number(prime) === 0) {
			attributes.push(primeMap[prime]);
		}
	}
	return attributes;
}

// --- MAIN EXPORTED FUNCTION ---

export interface DecodedEffect {
	name: string;
	radius: string;
	value: string;
	notes: string[];
}

// A human-readable summary of a decoded effect
export interface DecodedEffect {
	name: string;
	radius: string;
	value: string;
	notes: string[];
}

/**
 * Takes a raw EffectInstanceData object and translates it into a human-readable format.
 * @param effect The effect data object.
 * @returns A DecodedEffect object.
 */
export function decodeEffect(effect: EffectInstanceData): DecodedEffect {
	const name = effectStatusMap[effect.Status] ?? 'Unknown Effect';
	const decoded: DecodedEffect = { name, radius: '', value: '', notes: [] };

	// Decode Radius
	const radiusValue = effect.Radius;
	decoded.radius = `Radius: ${Math.abs(radiusValue).toFixed(2)}`;
	if (radiusValue < 0) {
		// Add notes for negative radius based on effect type
		if ([1, 2, 3, 11].includes(effect.Status)) {
			// Death, Ability, Permeation, Bounce
			decoded.notes.push('Light Shaft');
		}
		if (effect.Status === 0) {
			// Time Effect
			decoded.notes.push('Shootable');
		}
	}

	const value = effect.Value;
	let attrs: string[] = [];

	switch (effect.Status) {
		case 0: // Time
			decoded.value = `Time: ${value}`;
			break;
		case 2: // Ability Effect
			attrs = decodePrimes(value, abilityEffectPrimeMap);
			decoded.value = attrs.length > 0 ? `Attributes: ${attrs.join(', ')}` : 'Attributes: None';
			break;
		case 3: // Permeation Effect
			attrs = decodePrimes(value, permeationEffectPrimeMap);
			decoded.value = attrs.length > 0 ? `Attributes: ${attrs.join(', ')}` : 'Attributes: None';
			break;
		case 4: // Checkpoint Effect
			attrs = decodePrimes(value, checkpointEffectPrimeMap);
			decoded.value = attrs.length > 0 ? `Attributes: ${attrs.join(', ')}` : 'Attributes: None';
			break;
		case 5: // Entry Portal
		case 6: // Exit Portal
		case 10: // Shootable Orb
			attrs = decodePrimes(value, portalAndOrbPrimeMap);
			decoded.value = attrs.length > 0 ? `Attributes: ${attrs.join(', ')}` : 'Attributes: None';
			break;
		case 11: // Bounce
			const bounceData = value as { Direction: Vector3D; Power: number };
			const power = bounceData.Power;
			decoded.value = `Power: ${power.toFixed(3)}`;
			if (power === 0.016) decoded.notes.push('Stall effect');
			if (power === 0) decoded.notes.push('Stop effect (kills momentum)');
			break;
	}
	if (typeof value === 'number' && value < 0) {
		decoded.notes.push('Resets cooldown');
	}

	return decoded;
}
