/** 
/* 
/* ['hashed1', {
/* 	assets: [
/*		{
/*			source: 'https://d3dclx0mrf3ube.cloudfront.net/placeholder-photos/black-white-example/native.jpg',
/*			partial: '/placeholder-photos/black-white-example/native.jpg',
/*			path: '/Users/azimgd/Library/Developer/CoreSimulator/Devices/2B0CC81D-D028-41CD-B726-21C845DE628B/data/Containers/Data/Application/A78E3569-FD9D-43A3-B0E2-05633A6D754A/Library/Caches/ACME/placeholder-photos/black-white-example/native.jpg',
/*			pathFolder: '/Users/azimgd/Library/Developer/CoreSimulator/Devices/2B0CC81D-D028-41CD-B726-21C845DE628B/data/Containers/Data/Application/A78E3569-FD9D-43A3-B0E2-05633A6D754A/Library/Caches/ACME/placeholder-photos/black-white-example',
/*			isRemote: true,
/*			progress: 80,
/*			updatedAt: null
/*	  }
/* 	],
/* 	pointerSuccess: -1,
/* 	pointerLoading: -1,
/* 	status: 'idle',
/* }]
/* 
**/

export const StorageProvider = (input) => {
	const storage = new Map(input)

	const observables = new Map()

	const has = (key) => {
		return storage.has(key)
	}

	const get = (key) => {
		return storage.get(key)
	}

	const set = (key, value) => {
		return storage.set(key, value)
	}

	const subscribe = (key, callback) => {
		const current = observables.get(key) || []

		observables.set(key, [...current, callback])
		
		return () => {
			const current = observables.get(key) || []
			const modified = current.filter(s => s !== callback)

			if (modified.length) {
				observables.set(key, modified)
			} else {
				observables.delete(key)
			}
		}
	}

	const dispatch = (key, ...args) => {
		const current = observables.get(key) || []
		current.map((callback) => {
			if (typeof callback === 'function') {
				callback(...args)
			}
		})
	}

	return {
		has,
		get,
		set,
		subscribe,
		dispatch,
	}
}

export const Selectors = (() => {
	const clone = (object) => {
		return {
			pointerSuccess: object.pointerSuccess,
			pointerLoading: object.pointerLoading,
			status: object.status,
			assets: object.assets.map(item => ({ ...item })),
		}
	}

	const createSchema = () => {
		return { assets: [], pointerSuccess: -1, pointerLoading: -1, status: 'idle' }
	}

	const pushAsset = (object, value) => {
		object.assets.push({ ...value, progress: 0, updatedAt: null })
		return object
	}

	const getAssetByPath = (object, value) => {
		if (!object || !object.assets) return false
		if (!value || !value.path) return false
		return object.assets.find(item => item.path === value.path)
	}

	const shouldInitializeDownload = (object) => {
		if (!object || !object.assets) return false
		return object.assets.length === 1 && object.assets[0].progress === 0
	}

	const shouldContinueDownload = (object) => {
		if (!object || !object.assets) return false
		if (object.assets.length === 1 || object.assets[0].progress === 0) return false
		return (
			object.pointerLoading === object.pointerSuccess &&
			object.assets[object.pointerSuccess + 1]?.path
		)
	}

	const getAssetByCurrentPointer = (object, shifter) => {
		if (!object || !object.assets) return false
		if (!object.assets[object.pointerSuccess + (shifter || 0)]) return undefined
		return object.assets[object.pointerSuccess + (shifter || 0)]
	}

	const setProgress = (object, value) => {
		if (value < 0 || value > 100) return object
		object.assets[object.pointerLoading].progress = value
		object.assets[object.pointerLoading].updatedAt = Date.now()
		return object
	}

	const setStatus = (object, value) => {
		if (!['idle', 'loading', 'success', 'failure'].includes(value)) return object
		object.status = value
		return object
	}

	const incrementPointer = (object, type) => {
		if (!['pointerLoading', 'pointerSuccess'].includes(type)) return object
		if (object[type] + 1 >= object.assets.length) return object
		object[type] += 1
		return object
	}

	const decrementPointer = (object, type) => {
		if (!['pointerLoading', 'pointerSuccess'].includes(type)) return object
		if (object[type] - 1 < 0) return object
		object[type] -= 1
		return object
	}

	return {
		clone,
		createSchema,
		getAssetByPath,
		shouldInitializeDownload,
		shouldContinueDownload,
		getAssetByCurrentPointer,
		pushAsset,
		setProgress,
		setStatus,
		incrementPointer,
		decrementPointer,
	}
})()

export const TrackerProvider = (storage) => {
	const getAssetByPath = (key, signature) => {
		const current = storage.get(key)
		return Selectors.getAssetByPath(current, signature)
	}

	const getAssetByCurrentPointer = (key, shifter) => {
		const current = storage.get(key)
		return Selectors.getAssetByCurrentPointer(current, shifter)
	}

	const shouldInitializeDownload = (key) => {
		const current = storage.get(key)
		return Selectors.shouldInitializeDownload(current)
	}

	const shouldContinueDownload = (key) => {
		const current = storage.get(key)
		return Selectors.shouldContinueDownload(current)
	}

	const incrementPointer = (key, type) => {
		const current = Selectors.clone(storage.get(key))
		Selectors.incrementPointer(current, type)
		storage.set(key, current)
		// storage.dispatch(key, { type: 'shift', value: current })
	}

	const decrementPointer = (key, type) => {
		const current = Selectors.clone(storage.get(key))
		Selectors.decrementPointer(current, type)
		storage.set(key, current)
		// storage.dispatch(key, { type: 'shift', value: current })
	}

	const queue = (key, signature) => {
		const current = storage.get(key) || Selectors.createSchema()
		Selectors.pushAsset(current, signature)
		storage.set(key, current)
		storage.dispatch(key, { type: 'queue', value: current })
	}

	const progress = (key, downloaded) => {
		if (!storage.has(key) || !downloaded || downloaded < 0 || downloaded > 100) return
		const current = Selectors.clone(storage.get(key))
		Selectors.setProgress(current, downloaded)
		Selectors.setStatus(current, 'loading')
		storage.set(key, current)
		storage.dispatch(key, { type: 'progress', value: current })
	}

	const success = (key) => {
		if (!storage.has(key)) return
		const current = Selectors.clone(storage.get(key))
		Selectors.setProgress(current, 100)
		Selectors.setStatus(current, 'success')
		storage.set(key, current)
		storage.dispatch(key, { type: 'success', value: current })
	}

	const failure = (key) => {
		if (!storage.has(key)) return
		const current = Selectors.clone(storage.get(key))
		Selectors.setProgress(current, 0)
		Selectors.setStatus(current, 'failure')
		storage.set(key, current)
		storage.dispatch(key, { type: 'failure', value: current })
	}

	return {
		incrementPointer,
		decrementPointer,
		getAssetByPath,
		getAssetByCurrentPointer,
		shouldInitializeDownload,
		shouldContinueDownload,
		queue,
		progress,
		success,
		failure,
	}
}

const adapter = (input) => {
	const storage = StorageProvider(input)
	const tracker = TrackerProvider(storage)

	return {
		incrementPointer: tracker.incrementPointer,
		decrementPointer: tracker.decrementPointer,
		getAssetByPath: tracker.getAssetByPath,
		getAssetByCurrentPointer: tracker.getAssetByCurrentPointer,
		shouldInitializeDownload: tracker.shouldInitializeDownload,
		shouldContinueDownload: tracker.shouldContinueDownload,
		queue: tracker.queue,
		progress: tracker.progress,
		success: tracker.success,
		failure: tracker.failure,
		subscribe: storage.subscribe,
	}
}

export default adapter
