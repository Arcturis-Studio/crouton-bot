type Result = {
	command: string;
	rolls: Die[];
	total: number;
};

class Die {
	public sides: number;
	public roll: number;

	constructor(sides: number, roll?: number) {
		this.sides = sides;
		this.roll = roll ? roll : this.generateRoll();
	}

	private generateRoll = () => {
		return Math.floor(Math.random() * this.sides) + 1;
	};
}

export class Roll {
	// 1d20 2d4 3d8 etc
	private _diceList: string = '';
	public roll: number;
	public result: Result[] = [];
	private _total: number = 0;
	// TODO: Theoretical total/max
	// HBTG Example Message https://discord.com/channels/1032020955930841128/1032020956622893108/1185808472638488597
	private rollListLeader: string = '> ';

	constructor(diceList: string, roll: number = 1) {
		this.diceList = this.removeLeader(diceList);
		this.roll = roll;

		this.parseDiceList();
	}

	private parseDiceList() {
		this.result = this.diceList.split(' ').map((command) => {
			command = command.trim();
			const [count, sides] = command.split('d');
			const rolls = new Array(parseInt(count)).fill(0).map(() => new Die(parseInt(sides)));

			return {
				command: command,
				rolls: rolls,
				total: rolls.map((die) => die.roll).reduce((a, b) => a + b)
			};
		});
	}

	private removeLeader(message: string) {
		// There should only be one block quote, so the first filter result should be okay
		const messageComponents = message.split('\n');
		const previousRoll = messageComponents.filter((component) =>
			component.startsWith(this.rollListLeader)
		);

		// If previousRoll is empty, then this is a new and fresh roll
		if (!previousRoll[0]) {
			return message;
		}

		// If previousRoll is not empty, then replace the leader and continue as if a new roll.
		return previousRoll[0].replace(this.rollListLeader, '');
	}

	public generateMessage() {
		const title = `# Here are your roll results!`;
		const roll = `## Roll #${this.roll}`;
		const rollList = `${this.rollListLeader}${this.diceList}`;
		const total = `## Total: ${this.total}`;

		const rolls = this.result.map((roll) => {
			if (roll.rolls.length == 1) {
				return `- ${roll.command}: ${roll.rolls[0].roll}`;
			}

			const dieRolls = roll.rolls.map((die) => {
				return `${die.roll}`;
			});

			return `- ${roll.command}: ${dieRolls.join(' + ')} = ${roll.total}`;
		});

		const formattedMessage = [title, roll, rollList, rolls.join('\n'), total].join('\n');

		// NOTE: This is kind of a magic number, this limit is set by Discord. Should this be a prop of the class?
		// Maybe I should add these limits to a const file?
		if (formattedMessage.length > 2000) {
			throw new Error(
				"The formatted message length is too large. Discord's message limit is 2000 characters."
			);
		}

		return formattedMessage;
	}

	public get total(): number {
		this._total = this.result
			.map((roll) => roll.rolls.map((die) => die.roll).reduce((a, b) => a + b))
			.reduce((a, b) => a + b);

		return this._total;
	}

	// Checks the validity of a given diceList with a regex pattern
	public set diceList(diceList: string) {
		const lowercaseDice = diceList.toLowerCase();
		// NOTE: This could get very hairy very quick if we advance past just *d* pattern
		const diceRegex = new RegExp('^\\d+d\\d+( \\d+d\\d+)*$', 'gm');

		if (!diceRegex.test(lowercaseDice)) {
			throw new Error('Invalid dice list');
		}

		this._diceList = lowercaseDice;
	}

	public get diceList(): string {
		return this._diceList;
	}
}
