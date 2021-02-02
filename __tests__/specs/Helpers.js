import * as Helpers from 'Helpers'

describe('Helpers', () => {
	it('returns same hash for same input', () => {
		const hashOne = Helpers.getPartial('input string')
		const hashTwo = Helpers.getPartial('input string')
		const hashThree = Helpers.getPartial('input1 string')
		
		expect(hashOne).toHaveLength(36)
		expect(hashOne).toEqual(hashTwo)
		expect(hashOne).not.toEqual(hashThree)
	})
})