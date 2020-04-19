import HLFClient from './client';

// eslint-disable-next-line max-len
const createClient = (connectionProfile, hlfVersion = 1.4) => new HLFClient(connectionProfile, hlfVersion);

// const test = createClient('/home/tests/fixtures/config/hyperledger-fabric-sdk-config.yaml');

// // import path from 'path';

// // (async () => {
// //   process.env.GOPATH = `${path.resolve(process.cwd())}/tests`;

// //   try {
// //     await test.createChannel();
// //     await test.joinChannel();
// //     await test.installChaincode('sacc', 'hyperledger-fabric-chaincode', 'golang', '1.0');
// //   } catch (error) {
// //     console.log(error);
// //   }
// // })();

export default createClient;
