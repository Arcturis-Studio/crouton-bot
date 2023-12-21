import { describe, it, expect } from 'vitest';
import { Roll } from '../../structs/Roll';

describe('Roll', () => {
	describe('set diceList', () => {
		describe('should throw an error if the dice list is invalid', () => {
			const error = 'Invalid dice list';
			it.each([
				{ diceList: '', expected: 'Invalid dice list or previous roll message was provided' },
				{ diceList: 'abc', expected: error },
				{ diceList: '123', expected: error },
				{ diceList: '1d20a', expected: error },
				{ diceList: '20d1b', expected: error },
				{ diceList: '20d1 2gd4', expected: error },
				{ diceList: '20d1b 12d7', expected: error }
			])('$diceList', ({ diceList, expected }) => {
				expect(() => new Roll(diceList)).toThrowError(expected);
			});
		});

		describe('should not throw an error if the dice list is valid', () => {
			it.each([
				{ diceList: '1d20' },
				{ diceList: '1d8 1d4' },
				{ diceList: '30d50' },
				{ diceList: '20d1' }
			])('$diceList', ({ diceList }) => {
				expect(() => new Roll(diceList)).not.toThrowError('Invalid dice list');
			});
		});
	});

	describe('get total', () => {
		it.each([
			{
				diceList: '1d20',
				expected: {
					total: { min: 1, max: 20 },
					result: [{ count: 1, sides: 20, roll: { min: 1, max: 20 } }]
				}
			},
			{
				diceList: '1d8 2d4',
				expected: {
					total: { min: 1, max: 16 },
					result: [
						{ count: 1, sides: 8, roll: { min: 1, max: 8 } },
						{ count: 2, sides: 4, roll: { min: 1, max: 4 } }
					]
				}
			}
		])('$diceList', ({ diceList, expected }) => {
			const roll = new Roll(diceList);

			for (const dieIndex in roll.result) {
				const die = roll.result[dieIndex];
				const expectedDie = expected.result[dieIndex];

				expect(die.rolls.length).toEqual(expectedDie.count);

				for (const dieRollIndex in die.rolls) {
					const dieRoll = die.rolls[dieRollIndex];

					expect(dieRoll.roll).toBeGreaterThanOrEqual(expectedDie.roll.min);
					expect(dieRoll.roll).toBeLessThanOrEqual(expectedDie.roll.max);
					expect(dieRoll.sides).toEqual(expectedDie.sides);
				}
			}

			expect(roll.total).toBeGreaterThanOrEqual(expected.total.min);
			expect(roll.total).toBeLessThanOrEqual(expected.total.max);
		});
	});

	describe('generateMessage', () => {
		describe('should generate a markdown formatted message', () => {
			it.each([
				{
					diceList: '1d20',
					expected: `# Here are your roll results!\n## Roll #1\n- 1d20: 20\n## Total: 20`
				},
				{
					diceList: '1d8 2d4',
					expected: `# Here are your roll results!\n## Roll #1\n- 1d8: 8 = 8\n- 2d4: 8 + 4 = 12\n## Total: 8 + 4 = 12`
				}
			])('$diceList', ({ diceList }) => {
				const roll = new Roll(diceList);
				const message = roll.generateMessage();

				expect(message).toContain('# Here are your roll results!');
				expect(message).toContain('## Roll #');
				expect(message).toContain('## Total: ');
			});
		});

		it('should throw an error when generateMessage is longer than 2k characters', () => {
			const diceList = new Array(250).fill('1d1').join(' ');
			const roll = new Roll(diceList);

			expect(() => roll.generateMessage()).toThrowError(
				"The formatted message length is too large. Discord's message limit is 2000 characters."
			);
		});
	});

	describe('previousRollMessage', () => {
		it('should throw an error when both diceList and previousRollMessage not not provided', () => {
			expect(() => new Roll()).toThrowError(
				'Invalid dice list or previous roll message was provided'
			);
		});

		it('should should set roll number when previousRollMessage is provided', () => {
			const oldRoll = new Roll('1d20 2d4');
			const oldMessage = oldRoll.generateMessage();

			const newRoll = new Roll('', oldMessage);

			expect(newRoll.roll).toEqual(2);
		});

		it('should should roll the same roll command', () => {
			const rollCommand = '1d20 2d4';
			const oldRoll = new Roll(rollCommand);
			const oldMessage = oldRoll.generateMessage();

			const newRoll = new Roll('', oldMessage);

			expect(newRoll.diceList).toEqual(rollCommand);
		});
	});
});
