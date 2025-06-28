export interface MissionDefinition {
	name: string;
	prime: number;
}

export const ALL_MISSIONS: MissionDefinition[] = [
	{ name: 'No Rocket Punch', prime: 2 },
	{ name: 'No Uppercut', prime: 3 },
	{ name: 'No Seismic Slam', prime: 5 },
	{ name: 'Stallless', prime: 7 },
	{ name: 'Headbounce', prime: 11 },
	{ name: '360 Spin', prime: 13 },
	{ name: 'Use Rocket Punch First', prime: 17 },
	{ name: 'Use Uppercut First', prime: 19 },
	{ name: 'Use Seismic Slam First', prime: 23 },
	{ name: 'Diagonal Rocket Punch', prime: 29 },
	{ name: 'Down Diagonal Rocket Punch', prime: 31 },
	{ name: 'Rocket Punch Bounce', prime: 37 }
];
