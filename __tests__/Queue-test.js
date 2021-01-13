import StorageProvider from '../Provider/Storage'
import { QueueProvider, fetchWorker } from '../Provider/Queue'

jest.mock('react-native-fs', () => {
  return {
    mkdir: jest.fn(),
    moveFile: jest.fn(),
    copyFile: jest.fn(),
    pathForBundle: jest.fn(),
    pathForGroup: jest.fn(),
    getFSInfo: jest.fn(),
    getAllExternalFilesDirs: jest.fn(),
    unlink: jest.fn(),
    exists: jest.fn(),
    stopDownload: jest.fn(),
    resumeDownload: jest.fn(),
    isResumable: jest.fn(),
    stopUpload: jest.fn(),
    completeHandlerIOS: jest.fn(),
    readDir: jest.fn(),
    readDirAssets: jest.fn(),
    existsAssets: jest.fn(),
    readdir: jest.fn(),
    setReadable: jest.fn(),
    stat: jest.fn(),
    readFile: jest.fn(),
    read: jest.fn(),
    readFileAssets: jest.fn(),
    hash: jest.fn(),
    copyFileAssets: jest.fn(),
    copyFileAssetsIOS: jest.fn(),
    copyAssetsVideoIOS: jest.fn(),
    writeFile: jest.fn(),
    appendFile: jest.fn(),
    write: jest.fn(),
    downloadFile: jest.fn(),
    uploadFiles: jest.fn(),
    touch: jest.fn(),
    MainBundlePath: jest.fn(),
    CachesDirectoryPath: jest.fn(),
    DocumentDirectoryPath: jest.fn(),
    ExternalDirectoryPath: jest.fn(),
    ExternalStorageDirectoryPath: jest.fn(),
    TemporaryDirectoryPath: jest.fn(),
    LibraryDirectoryPath: jest.fn(),
    PicturesDirectoryPath: jest.fn(),
  }
})

const defaultSample = [
  ['hashed1', {
    assets: [
      { source: 'low.jpg', progress: 0, updatedAt: null },
      { source: 'mid.jpg', progress: 0, updatedAt: null },
      { source: 'high.jpg', progress: 0, updatedAt: null },
    ],
    pointerSuccess: 0,
    pointerLoading: 0,
    status: 'idle',
  }],
]

const progressingSample = [
  ['hashed1', {
    assets: [
      { source: 'low.jpg', progress: 100, updatedAt: null },
      { source: 'mid.jpg', progress: 80, updatedAt: null },
      { source: 'high.jpg', progress: 0, updatedAt: null },
    ],
    pointerSuccess: 1,
    pointerLoading: 1,
    status: 'idle',
  }],
]

describe('Queue', () => {
  // it('queues new items', async () => {
  //   const fetchSpy = jest.fn()
  //   const queue = QueueProvider(StorageProvider(), (args) => fetchSpy(args), (args) => fetchSpy(args))

  //   queue.push('2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC', { source: 'http://google.com/image.png', path: 'temp/image.png' })
  //   await new Promise((r) => setTimeout(r, 10))

  //   expect(fetchSpy).toHaveBeenCalledWith({ groupHash: '2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC', signature: { source: 'http://google.com/image.png', path: 'temp/image.png' } })
  // })

  // it('queueing same items multiple times handled only once', async () => {
  //   const fetchSpy = jest.fn()
  //   const queue = QueueProvider(StorageProvider(), (args) => fetchSpy(args), (args) => fetchSpy(args))

  //   queue.push('2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC', { source: 'http://google.com/image.png', path: 'temp/image.png' })
  //   queue.push('2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC', { source: 'http://google.com/image.png', path: 'temp/image.png' })
  //   queue.push('2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC', { source: 'http://google.com/image.png', path: 'temp/image.png' })

  //   await new Promise((r) => setTimeout(r, 10))

  //   expect(fetchSpy).toHaveBeenCalledTimes(1)
  //   expect(fetchSpy).toHaveBeenNthCalledWith(1, { groupHash: '2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC', signature: { source: 'http://google.com/image.png', path: 'temp/image.png' } })
  // })

  it('queueing different items multiple times handled', async () => {
    const fetchSpy = jest.fn()
    const queue = QueueProvider(StorageProvider(), (args) => fetchSpy(args), (args) => fetchSpy(args))

    queue.push('2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC', { source: 'http://google.com/image.png', path: 'temp/image.png' })
    queue.push('2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC', { source: 'http://google.com/image-1.png', path: 'temp/image-1.png' })
    queue.push('2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC', { source: 'http://google.com/image-2.png', path: 'temp/image-2.png' })
    queue.push('2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC', { source: 'http://google.com/image-1.png', path: 'temp/image-1.png' })
    queue.push('2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC', { source: 'http://google.com/image-2.png', path: 'temp/image-2.png' })

    await new Promise((r) => setTimeout(r, 10))

    expect(fetchSpy).toHaveBeenCalledTimes(3)
    expect(fetchSpy).toHaveBeenNthCalledWith(1, { groupHash: '2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC', signature: { source: 'http://google.com/image.png', path: 'temp/image.png' } })
    expect(fetchSpy).toHaveBeenNthCalledWith(2, { groupHash: '2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC', signature: { source: 'http://google.com/image.png', path: 'temp/image.png' } })
    expect(fetchSpy).toHaveBeenNthCalledWith(3, { groupHash: '2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC', signature: { source: 'http://google.com/image.png', path: 'temp/image.png' } })
  })

  // it('processes items at queue', async () => {
  //   const trackerSpy = jest.fn()
  //   const checkLocalImageSpy = jest.fn()
  //   const fetchLocalImageSpy = jest.fn()
  //   const fetchRemoteImageSpy = jest.fn()
  //   fetchWorker(trackerSpy, checkLocalImageSpy, fetchLocalImageSpy, fetchRemoteImageSpy)({ signature: { source: 'http://google.com/image.png', path: 'temp/image.png'} }, () => {})
  //   await new Promise((r) => setTimeout(r, 10))
  //   expect(fetchRemoteImageSpy).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       signature: { source: 'http://google.com/image.png', path: 'temp/image.png'},
  //       progressCallback: expect.any(Function),
  //       requestCallback: expect.any(Function),
  //       failureCallback: expect.any(Function),
  //       successCallback: expect.any(Function),
  //     })
  //   )
  // })
})
