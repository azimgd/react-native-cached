import { QueueProvider } from 'Queue'

const fetchQueueWorkerSpy = jest.fn()
const trackerProviderSpy = ({
  getAssetByPath: jest.fn(),
  shouldInitializeDownload: jest.fn(),
  queue: jest.fn(),
  shouldContinueDownload: jest.fn(),
  getAssetByCurrentPointer: jest.fn(),
})

describe('QueueProvider.push', () => {
  const groupHash = '2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC'
  const signature = { source: 'http://google.com/image.png', path: 'temp/image.png' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('adds new items in the queue if provided asset does not exist', async () => {
    trackerProviderSpy.getAssetByPath.mockReturnValueOnce(false)

    const queue = QueueProvider(trackerProviderSpy, () => {}, () => {})
    queue.push(groupHash, signature)

    expect(trackerProviderSpy.queue).toHaveBeenCalledWith(groupHash, signature)
  })

  it('does not add new items in the queue if provided asset exists', async () => {
    trackerProviderSpy.getAssetByPath.mockReturnValueOnce(true)

    const queue = QueueProvider(trackerProviderSpy, () => {}, () => {})
    queue.push(groupHash, signature)

    expect(trackerProviderSpy.queue).not.toHaveBeenCalledWith(groupHash, signature)
  })

  it('runs queue worker if single asset is provided', async () => {
    trackerProviderSpy.shouldInitializeDownload.mockReturnValueOnce(true)
    trackerProviderSpy.shouldContinueDownload.mockReturnValueOnce(false)

    const queue = QueueProvider(trackerProviderSpy, (task, callback) => { fetchQueueWorkerSpy(task); callback() })
    queue.push(groupHash, signature)
    await queue.fetchQueue.drain()

    expect(fetchQueueWorkerSpy).toHaveBeenCalledWith({ groupHash, signature })
  })

  it('runs queue worker if multiple assets are provided and next item is available', async () => {
    trackerProviderSpy.shouldInitializeDownload.mockReturnValueOnce(false)
    trackerProviderSpy.shouldContinueDownload.mockReturnValueOnce(true)

    const queue = QueueProvider(trackerProviderSpy, (task, callback) => { fetchQueueWorkerSpy(task); callback() })
    queue.push(groupHash, signature)
    await queue.fetchQueue.drain()

    expect(fetchQueueWorkerSpy).toHaveBeenCalledWith({ groupHash, signature })
  })

  it('does not run queue worker if next item is not available or should not be initialized', async () => {
    trackerProviderSpy.shouldInitializeDownload.mockReturnValueOnce(false)
    trackerProviderSpy.shouldContinueDownload.mockReturnValueOnce(false)

    const queue = QueueProvider(trackerProviderSpy, (task, callback) => { fetchQueueWorkerSpy(task); callback() })
    queue.push(groupHash, signature)

    expect(queue.fetchQueue.length()).toEqual(0)
    expect(fetchQueueWorkerSpy).not.toHaveBeenCalledWith({ groupHash, signature })
  })
})
