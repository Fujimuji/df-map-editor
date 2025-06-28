// src/lib/parser-logic/core/primeDecoder.ts

// This data is based on the '3.2 Prime Numbers' PDF, with your requested modifications.
export const primeSwitchMap: Record<number, string> = {
	2: 'Rocket Punch disabled',
	3: 'Rising Uppercut disabled',
	5: 'Seismic Slam disabled',
	7: 'Centerless upon completion',
	11: 'Multilevel Level Select',
	13: 'First checkpoint of a level',
	17: 'Effect Lock'
};

/**
 * Takes a prime product (e.g., 6) and decodes it into an array of its meanings
 * (e.g., ['Rocket Punch disabled', 'Rising Uppercut disabled']).
 * @param product The prime product number to decode.
 * @returns An array of strings describing the attributes.
 */
// src/lib/parser-logic/core/primeDecoder.ts

export function decodePrime(product: number | boolean | null): string[] {
	if (product === true) {
		product = 1;
	}

	if (typeof product !== 'number' || product <= 1) {
		return [];
	}

	const attributes: string[] = [];
	for (const prime in primeSwitchMap) {
		if (product % Number(prime) === 0) {
			attributes.push(primeSwitchMap[prime]);
		}
	}
	return attributes;
}
