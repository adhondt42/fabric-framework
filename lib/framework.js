import HLFClient from './client';

// eslint-disable-next-line max-len
const newClient = (connectionProfile, hlfVersion = 1.4) => new HLFClient(connectionProfile, hlfVersion);

const test = newClient('/home/tests/fixtures/config/hyperledger-fabric-sdk-config.yaml');

(async () => {
  await test.createChannel();
  await test.joinChannel();
})();

export default newClient;
