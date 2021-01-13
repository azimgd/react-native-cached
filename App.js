import React, { useEffect, useState } from 'react'
import { StyleSheet, Image, View } from 'react-native'
import * as Helpers from './Provider/Helpers'
import StorageProvider from './Provider/Storage'
import QueueProvider from './Provider/Queue'

const Storage = StorageProvider()
const queue = QueueProvider(Storage)

const CachedImage = ({
  style,
  groupHash,
}) => {
  const [asset, setAsset] = useState(null)

  useEffect(() => {
    const signature1 = Helpers.generateSignature('https://d3dclx0mrf3ube.cloudfront.net/placeholder-photos/black-white-example/native.jpg')
    queue.push(groupHash, signature1)

    const signature2 = Helpers.generateSignature('https://i.imgur.com/Y1I6WXx.jpg')
    queue.push(groupHash, signature2)

    const signature3 = Helpers.generateSignature('https://i.imgur.com/BQXN6t1.jpg')
    queue.push(groupHash, signature3)

    return Storage.subscribe(groupHash, setAsset)
  }, [])

  if (!asset || !asset.value.assets[asset.value.pointerSuccess]) {
    return null
  }

  const active = asset.value.assets[asset.value.pointerSuccess]

  return (
    <React.Fragment>
      <Image source={{ uri: active.path }} style={style} />
    </React.Fragment>
  )
}

const App = () => {
  return (
    <View style={styles.view}>
      {(Array.from(Array(1).keys())).map(item => 
        <CachedImage key={item} style={styles.image} groupHash="2ahUKEwiN8ZWm5ILuAhWRyoUKHXaSCEoQFjACegQIARAC1" />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 40,
  },
  image: {
    width: 80,
    height: 80,
  },
})

export default App
