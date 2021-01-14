import Storage from 'Storage'
import * as dataMock from './data.mock'

describe('Storage', () => {
	beforeAll(() => {
	  jest
	  	.spyOn(global.Date, 'now')
	    .mockImplementation(() => Date.parse('2020-02-14'))
	})

	it('queues new items', () => {
		const cache = Storage([])

		const spy = jest.fn()
		cache.subscribe('hashed1', spy)
		cache.queue('hashed1', dataMock.defaultSample[0][1].assets[0])
		expect(spy).toHaveBeenCalledTimes(1)
		expect(spy).toHaveBeenNthCalledWith(1, { type: 'queue', value: dataMock.defaultSample[0][1] })
	})
})