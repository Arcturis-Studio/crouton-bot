export const diceParser = (diceList: string) => {
	const dice = diceList.split(' ').map((die) => die.trim());

	const result = dice.map((die) => {
		const [num, sides] = die.split('d');
		return {
			num: parseInt(num),
			sides: parseInt(sides),
			roll: getRoll(parseInt(sides), parseInt(num))
		};
	});

	console.log(result);
	return result;
};

function getRoll(max: number, count: number) {
	let total = 0;
	for (let i = 0; i < count; i++) {
		total += Math.floor(Math.random() * max) + 1;
	}
	return total;
}
