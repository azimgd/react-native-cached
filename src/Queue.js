import RNFS from 'react-native-fs'
import priorityQueue from 'async/priorityQueue'
import asyncify from 'async/asyncify'

export const checkLocalImage = async (path) => {
  return await RNFS.exists(path)
}

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
  failureCallback,
  requestCallback,
  successCallback,
}) => {
  requestCallback()
  successCallback()
}

export const fetchWorker = (trackerProvider, checkLocalImage, fetchLocalImage, fetchRemoteImage) => asyncify(async (task) => {
  const requestCallback = () => {
    trackerProvider.incrementPointer(task.groupHash, 'pointerLoading')
    trackerProvider.progress(task.groupHash, 0.1)
  }

  const progressCallback = (data) => {
    const progress = parseInt(data.bytesWritten / data.contentLength * 100, 10)
    trackerProvider.progress(task.groupHash, progress)
  }

  const failureCallback = () => {
    trackerProvider.failure(task.groupHash)
  }

  const successCallback = () => {
    trackerProvider.incrementPointer(task.groupHash, 'pointerSuccess')
    trackerProvider.success(task.groupHash)
    console.log('success')
  }

  if (await checkLocalImage(task.signature.path)) {
    await fetchLocalImage({
      signature: task.signature,
      progressCallback,
      requestCallback,
      failureCallback,
      successCallback,
    })
  } else {
    await fetchRemoteImage({
      signature: task.signature,
      progressCallback,
      requestCallback,
      failureCallback,
      successCallback,
    })
  }
})

export const QueueProvider = (trackerProvider, fetchQueueWorker) => {
  const priority = 1
  const fetchQueue = priorityQueue(fetchQueueWorker, 1)

	const push = async (groupHash, signature) => {
    /**
     * Store asset if it doesn't exist in memory
     */
    if (!trackerProvider.getAssetByPath(groupHash, signature)) {
      trackerProvider.queue(groupHash, signature)
    }

    /**
     * Assuming current item has already pushed into the memory
     */
    if (
      trackerProvider.shouldInitializeDownload(groupHash) ||
      trackerProvider.shouldContinueDownload(groupHash)
    ) {
      console.log(trackerProvider.shouldInitializeDownload(groupHash), trackerProvider.shouldContinueDownload(groupHash))
      fetchQueue.push({ groupHash, signature }, priority, () => {
        push(groupHash, trackerProvider.getAssetByCurrentPointer(groupHash, 1))
      })
    }

    /**
     * Start asset if it hasn't initialized in queue
     */
    // if (!trackerProvider.getAssetByCurrentPointer(groupHash, 0)) {
    //   console.log('pushed into queue')
    //   fetchQueue.push({ groupHash, signature }, priority, () => {
        
    //   })
    // }
	}

	return {
		fetchQueue,
		push,
	}
}

let instance = null
export default (StorageProvider) => {
  if (!instance) {
    instance = QueueProvider(StorageProvider, fetchWorker(StorageProvider, checkLocalImage, fetchLocalImage, fetchRemoteImage))
  }
  return instance
}
