import HLFClient from './client';

// eslint-disable-next-line max-len
const createClient = (connectionProfile, hlfVersion = 1.4) => new HLFClient(connectionProfile, hlfVersion);

// const test = createClient('/home/tests/fixtures/config/hyperledger-fabric-sdk-config.yaml');

// (async () => {
//   try {
//     await test.createChannel();
//     await test.joinChannel();
//   } catch (error) {
//     console.log(error);
//   }
// })();

export default createClient;
