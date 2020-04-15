import test from 'ava';

import Config from '../lib/config';

test('no config path provided', (t) => {
  t.throws(() => {
    Config();
  });
});

test('invalid path', (t) => {
  t.throws(() => {
    Config('./invalid_path');
  });
});

test('valid configuration', (t) => {
  const cfg = new Config('./tests/fixtures/config/hyperledger-fabric-sdk-config.yaml');

  t.true(cfg.version === '1.0.0');
  t.true(cfg.clientOrganization === 'Org1');
  t.true(cfg.cryptoConfigPath === '../../hyperledger-fabric-network/crypto-config');
  t.true(cfg.mspID === 'Org1MSP');
  t.true(Array.isArray(cfg.channels) && cfg.channels[0] === 'channelall');
  t.true(Array.isArray(cfg.orderers) && cfg.orderers[0].name === 'orderer.dummy.com');
  t.true(Array.isArray(cfg.peers) && cfg.peers[0].name === 'peer0.org1.dummy.com');
});
