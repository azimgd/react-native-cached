import RNFS from 'react-native-fs'

const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909)
  h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1>>>0)
}


/**
 * 
 */
export const getPartial = (source) => {
  return cyrb53(source)
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