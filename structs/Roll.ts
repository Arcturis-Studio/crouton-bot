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

	constructor(diceList: string, roll: number = 1) {
		this.diceList = diceList;
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

	public generateMessage() {
		const title = `# Here are your roll results!`;
		const roll = `## Roll #${this.roll}`;
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

		const formattedMessage = `${title}\n> ${this.diceList}\n${roll}\n${rolls.join('\n')}\n${total}`;

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
