import React from 'react'
import Storage, { Selectors } from '../src/Storage'

const defaultSample = [
	['hashed1', {
		assets: [
			{
	      source: 'https://d3dclx0mrf3ube.cloudfront.net/placeholder-photos/black-white-example/native.jpg',
	      partial: '/placeholder-photos/black-white-example/native.jpg',
	      path: '/Users/azimgd/Library/Developer/CoreSimulator/Devices/2B0CC81D-D028-41CD-B726-21C845DE628B/data/Containers/Data/Application/A78E3569-FD9D-43A3-B0E2-05633A6D754A/Library/Caches/ACME/placeholder-photos/black-white-example/native.jpg',
	      pathFolder: '/Users/azimgd/Library/Developer/CoreSimulator/Devices/2B0CC81D-D028-41CD-B726-21C845DE628B/data/Containers/Data/Application/A78E3569-FD9D-43A3-B0E2-05633A6D754A/Library/Caches/ACME/placeholder-photos/black-white-example',
	      isRemote: true,
	      progress: 0,
	      updatedAt: null
	    },
		],
		pointerSuccess: 0,
		pointerLoading: 0,
		status: 'idle',
	}]
]

const progressingSample = [
	['hashed1', {
		assets: [
			{
	      source: 'https://d3dclx0mrf3ube.cloudfront.net/placeholder-photos/black-white-example/native.jpg',
	      partial: '/placeholder-photos/black-white-example/native.jpg',
	      path: '/Users/azimgd/Library/Developer/CoreSimulator/Devices/2B0CC81D-D028-41CD-B726-21C845DE628B/data/Containers/Data/Application/A78E3569-FD9D-43A3-B0E2-05633A6D754A/Library/Caches/ACME/placeholder-photos/black-white-example/native.jpg',
	      pathFolder: '/Users/azimgd/Library/Developer/CoreSimulator/Devices/2B0CC81D-D028-41CD-B726-21C845DE628B/data/Containers/Data/Application/A78E3569-FD9D-43A3-B0E2-05633A6D754A/Library/Caches/ACME/placeholder-photos/black-white-example',
	      isRemote: true,
	      progress: 100,
	      updatedAt: null
	    },
	    {
	      source: 'https://d3dclx0mrf3ube.cloudfront.net/placeholder-photos/black-white-example/native.jpg',
	      partial: '/placeholder-photos/black-white-example/native.jpg',
	      path: '/Users/azimgd/Library/Developer/CoreSimulator/Devices/2B0CC81D-D028-41CD-B726-21C845DE628B/data/Containers/Data/Application/A78E3569-FD9D-43A3-B0E2-05633A6D754A/Library/Caches/ACME/placeholder-photos/black-white-example/native.jpg',
	      pathFolder: '/Users/azimgd/Library/Developer/CoreSimulator/Devices/2B0CC81D-D028-41CD-B726-21C845DE628B/data/Containers/Data/Application/A78E3569-FD9D-43A3-B0E2-05633A6D754A/Library/Caches/ACME/placeholder-photos/black-white-example',
	      isRemote: true,
	      progress: 80,
	      updatedAt: null
	    },
		],
		pointerSuccess: 1,
		pointerLoading: 1,
		status: 'idle',
	}]
]

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
		cache.queue('hashed1', defaultSample[0][1].assets[0])
		expect(spy).toHaveBeenCalledTimes(1)
		expect(spy).toHaveBeenNthCalledWith(1, { type: 'queue', value: defaultSample[0][1] })
	})

	it('callback executed on progress', () => {
		const cache = Storage(defaultSample)
		const hashed1 = Selectors.clone({ ...defaultSample[0][1] })

		const spy = jest.fn()
		cache.subscribe('hashed1', spy)
		cache.progress('hashed1', 10)
		cache.progress('hashed1', 50)
		cache.progress('hashed1', 100)
		cache.success('hashed1')
		expect(spy).toHaveBeenCalledTimes(4)

		hashed1.status = 'loading'
		hashed1.assets[0].progress = 100
		hashed1.assets[0].updatedAt = 1581638400000
		expect(spy).toHaveBeenNthCalledWith(3, { type: 'progress', value: hashed1 })
		hashed1.status = 'success'
		expect(spy).toHaveBeenNthCalledWith(4, { type: 'success', value: hashed1 })
	})

	it('callback executed on success', () => {
		const cache = Storage(defaultSample)
		const hashed1 = Selectors.clone({ ...defaultSample[0][1] })

		const spy = jest.fn()
		cache.subscribe('hashed1', spy)
		cache.success('hashed1')
		expect(spy).toHaveBeenCalledTimes(1)

		hashed1.status = 'success'
		hashed1.assets[0].progress = 100
		hashed1.assets[0].updatedAt = 1581638400000
		expect(spy).toHaveBeenNthCalledWith(1, { type: 'success', value: hashed1 })
	})

	it('callback executed on failure', () => {
		const cache = Storage(defaultSample)
		const hashed1 = Selectors.clone({ ...defaultSample[0][1] })

		const spy = jest.fn()
		cache.subscribe('hashed1', spy)
		cache.failure('hashed1')
		expect(spy).toHaveBeenCalledTimes(1)

		hashed1.status = 'failure'
		hashed1.assets[0].progress = 0
		hashed1.assets[0].updatedAt = 1581638400000
		expect(spy).toHaveBeenNthCalledWith(1, { type: 'failure', value: hashed1 })
	})

	it('callback executed on failure', () => {
		const cache = Storage(progressingSample)
		const hashed1 = Selectors.clone({ ...progressingSample[0][1] })

		const spy = jest.fn()
		cache.subscribe('hashed1', spy)
		cache.failure('hashed1')
		expect(spy).toHaveBeenCalledTimes(1)

		hashed1.status = 'failure'
		hashed1.assets[1].progress = 0
		hashed1.assets[1].updatedAt = 1581638400000
		expect(spy).toHaveBeenNthCalledWith(1, { type: 'failure', value: hashed1 })
	})
})

describe('Selectors', () => {
	it('clones storage object', () => {
		const hashed1 = Selectors.clone({ ...defaultSample[0][1] })
		expect(hashed1).toEqual(defaultSample[0][1])
		hashed1.status = 'success'
		hashed1.assets[0].progress = 100
		hashed1.pointerSuccess = 1

		expect(hashed1.status).not.toEqual(defaultSample[0][1].status)
		expect(hashed1.assets[0].progress).not.toEqual(defaultSample[0][1].assets[0].progress)
		expect(hashed1.pointerSuccess).not.toEqual(defaultSample[0][1].pointerSuccess)
	})

	it('craetes storage object', () => {
		const hashed1 = Selectors.createSchema()
		expect(hashed1).toEqual({ assets: [], pointerSuccess: 0, pointerLoading: 0, status: 'idle' })
	})

	it('pushes asset to storage object', () => {
		const hashed1 = Selectors.clone({ ...defaultSample[0][1] })
		Selectors.pushAsset(hashed1, defaultSample[0][1].assets[0])
		Selectors.pushAsset(hashed1, defaultSample[0][1].assets[0])
		Selectors.pushAsset(hashed1, defaultSample[0][1].assets[0])
		expect(hashed1.assets).toHaveLength(4)
		expect(hashed1.assets[3]).toEqual(defaultSample[0][1].assets[0])
	})

	it('sets progress on asset at storage object', () => {
		const hashed1 = Selectors.clone({ ...defaultSample[0][1] })
		Selectors.pushAsset(hashed1, defaultSample[0][1].assets[0])
		Selectors.setProgress(hashed1, 88)
		expect(hashed1.assets[0].progress).toEqual(88)
		expect(hashed1.assets[1].progress).toEqual(0)
	})

	it('sets status on storage object', () => {
		const hashed1 = Selectors.clone({ ...defaultSample[0][1] })
		Selectors.setStatus(hashed1, 'idle')
		expect(hashed1.status).toEqual('idle')
		Selectors.setStatus(hashed1, 'loading')
		expect(hashed1.status).toEqual('loading')
		Selectors.setStatus(hashed1, 'success')
		expect(hashed1.status).toEqual('success')
		Selectors.setStatus(hashed1, 'failure')
		expect(hashed1.status).toEqual('failure')
		Selectors.setStatus(hashed1, 'wrong')
		expect(hashed1.status).toEqual('failure')
	})

	it('increments pointer at storage object', () => {
		const hashed1 = Selectors.clone({ ...defaultSample[0][1] })
		Selectors.incrementPointer(hashed1, 'pointerSuccess')
		expect(hashed1.pointerSuccess).toEqual(0)
		Selectors.incrementPointer(hashed1, 'pointerLoading')
		expect(hashed1.pointerLoading).toEqual(0)

		Selectors.pushAsset(hashed1, defaultSample[0][1].assets[0])

		Selectors.incrementPointer(hashed1, 'pointerSuccess')
		expect(hashed1.pointerSuccess).toEqual(1)
		Selectors.incrementPointer(hashed1, 'pointerSuccess')
		expect(hashed1.pointerSuccess).toEqual(1)
		Selectors.incrementPointer(hashed1, 'pointerLoading')
		expect(hashed1.pointerLoading).toEqual(1)
		Selectors.incrementPointer(hashed1, 'pointerLoading')
		expect(hashed1.pointerLoading).toEqual(1)
	})

	it('decrements pointer at storage object', () => {
		const hashed1 = Selectors.clone({ ...defaultSample[0][1] })
		Selectors.decrementPointer(hashed1, 'pointerSuccess')
		expect(hashed1.pointerSuccess).toEqual(0)
		Selectors.pushAsset(hashed1, defaultSample[0][1].assets[0])
		Selectors.incrementPointer(hashed1, 'pointerSuccess')
		expect(hashed1.pointerSuccess).toEqual(1)
		Selectors.decrementPointer(hashed1, 'pointerSuccess')
		expect(hashed1.pointerSuccess).toEqual(0)
	})
})