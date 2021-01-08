import RNFS from 'react-native-fs'
import priorityQueue from 'async/priorityQueue'
import asyncify from 'async/asyncify'

export const fetchRemoteImage = async ({
  signature,
  progressCallback,
  requestCallback,
  failureCallback,
  successCallback,
}) => {
  await RNFS.mkdir(signature.pathFolder)

  const { promise, jobId } = RNFS.downloadFile({
    fromUrl: signature.source,
    toFile: signature.path,
    background: false,
    discretionary: true,
    cacheable: false,
    readTimeout: 30000,
    backgroundTimeout: 30000,
    progressDivider: 20,
    resumable: () =>
      RNFS.isResumable(jobId).then(() => RNFS.resumeDownload(jobId)),
    begin: requestCallback,
    progress: progressCallback,
  })

  try {
    const response = await promise
    // await RNFS.completeHandlerIOS(jobId)

    if (response.statusCode !== 200) {
      throw new Error(`http error ${response.statusCode}`)
    }

    return successCallback({
      jobId,
      signature,
      response,
    })
  } catch (error) {
    return failureCallback({
      jobId,
      signature,
      error,
    })
  }
}

export const fetchLocalImage = async ({
  signature,
  progressCallback,
  requestCallback,
  failureCallback,
  successCallback,
}) => {
}

export const fetchWorker = (trackerProvider, fetchRemoteImage) => asyncify(async (task) => {
  const requestCallback = () => {
    trackerProvider.incrementPointer(task.groupHash, 'pointerLoading')
  }

  const progressCallback = (data) => {
    const progress = parseInt(data.bytesWritten / data.contentLength * 100, 10)
    trackerProvider.progress(task.groupHash, progress)
  }

  const failureCallback = () => {
    trackerProvider.failure(task.groupHash)
  }

  const successCallback = () => {
    trackerProvider.success(task.groupHash)
    trackerProvider.incrementPointer(task.groupHash, 'pointerSuccess')
  }

  await fetchRemoteImage({
    signature: task.signature,
    progressCallback,
    requestCallback,
    failureCallback,
    successCallback,
  })
})

export const cacheWorker = (trackerProvider) => async (task) => {
  const failureCallback = () => {
    trackerProvider.failure(task.groupHash)
  }

  const successCallback = () => {
    trackerProvider.success(task.groupHash)
  }

  await fetchLocalImage({
    signature: task.signature,
    failureCallback,
    successCallback,
  })
}

export const QueueProvider = (trackerProvider, fetchQueueWorker, cacheQueueWorker) => {
  const priority = 1
  const fetchQueue = priorityQueue(fetchQueueWorker, 3)
  const cacheQueue = priorityQueue(cacheQueueWorker, 3)

	const push = (groupHash, signature) => {
    const initialAsset = trackerProvider.getAssetByPointer(groupHash, 0)
    const currentAsset = trackerProvider.getAssetByPath(groupHash, signature)

    /**
     * @TODO: investigate race condition
     */
    if (currentAsset) {
      return
    }

    trackerProvider.queue(groupHash, signature)

    if (!initialAsset) {
      fetchQueue.push({ groupHash, signature }, priority, () => {
        const nextAsset = trackerProvider.getAssetByPointer(groupHash, 0)

        if (nextAsset && nextAsset.progress === 0) {
          fetchQueue.push({ groupHash, signature: nextAsset })
        }
      })
    }
	}

	return {
		fetchQueue,
		push,
	}
}

let instance = null
export default (StorageProvider) => {
  if (!instance) {
    instance = QueueProvider(StorageProvider, fetchWorker(StorageProvider, fetchRemoteImage), cacheWorker(StorageProvider))
  }
  return instance
}

// export default (StorageProvider) => QueueProvider(StorageProvider, fetchWorker(StorageProvider, fetchRemoteImage))
