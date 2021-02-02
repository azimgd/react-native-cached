import RNFS from 'react-native-fs'
import { v5 as uuidv5 } from 'uuid'

/**
 * 
 */
export const getPartial = (source) => {
  return uuidv5(source, uuidv5.URL)
}

/**
 * 
 */
export const getIsRemote = (source) => {
  return source.includes('http://') || source.includes('https://')
}

/**
 * 
 */
export const generateSignature = (source) => {
  if (typeof source !== 'string' || !source.length) {
    return {
      partial: '',
      path: '',
      isRemote: '',
    }
  }

  const isRemote = getIsRemote(source)
  const partial = getPartial(source)
  const path = isRemote ? `${RNFS.CachesDirectoryPath}/ACME/${partial}.jpg` : source
  const pathFolder = path.substring(0, path.lastIndexOf('/'))

  return {
    source,
    partial,
    path,
    pathFolder,
    isRemote,
  }
}

/**
 * 
 */
export const getPriority = (filename = '', priority = 0) => {
  if (filename.includes('64p')) {
    return priority
  }
  if (filename.includes('480p')) {
    return 1000 + priority
  }
  if (filename.includes('4K')) {
    return 10000 + priority
  }
  if (filename.includes('native')) {
    return 100000 + priority
  }
  return 0
}

/**
 * 
 */
export const getFilename = (source) => {
  if (!source) return ''
  const withoutQuery = source.split('?').shift()
  const withoutPath = withoutQuery.split('/').pop()
  const withoutExt = withoutPath.split('.').shift()
  return withoutExt
}

/**
 *
 */
export const checkLocalImage = async (path) => {
  return await RNFS.exists(path)
}