import { QueueProvider } from 'Queue'

const delay = (time = 10) => new Promise((r) => setTimeout(r, time))

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

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('adds new items in the queue when queue was empty before', async () => {
    trackerProviderSpy.getAssetByPath.mockReturnValueOnce(false)
    trackerProviderSpy.shouldInitializeDownload.mockReturnValueOnce(true)

    const queue = QueueProvider(trackerProviderSpy, (args) => fetchQueueWorkerSpy(args), () => {})

    queue.push(groupHash, signature)
    await delay()

    expect(fetchQueueWorkerSpy).toHaveBeenCalledWith({ groupHash, signature })
    expect(trackerProviderSpy.queue).toHaveBeenCalledWith(groupHash, signature)
  })
})
