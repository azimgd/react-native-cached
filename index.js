// /**
//  * @format
//  */

// import {AppRegistry} from 'react-native';
// import App from './App';
// import {name as appName} from './app.json';

// AppRegistry.registerComponent(appName, () => App);

module.exports = {
  Helpers: require('./dist/Helpers.js'),
  Queue: require('./dist/Queue.js'),
  Storage: require('./dist/Storage.js'),
}
