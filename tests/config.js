import * as fs from 'fs';
import path from 'path';
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

  t.true(cfg.adminTLSCertificatePath.length > 0 && path.isAbsolute(cfg.adminTLSCertificatePath));
  t.true(cfg.adminTLSPrivateKeyPath.length > 0 && path.isAbsolute(cfg.adminTLSPrivateKeyPath));
  // eslint-disable-next-line max-len
  t.true(cfg.channelArtifactsPath.length > 0 && path.isAbsolute(cfg.channelArtifactsPath) && fs.lstatSync(cfg.channelArtifactsPath).isDirectory());
  t.true(Array.isArray(cfg.channels) && cfg.channels[0] === 'channelall');
  t.true(cfg.clientOrganization === 'Org1');
  t.true(cfg.clientTLSCertificatePath.length > 0 && path.isAbsolute(cfg.clientTLSCertificatePath));
  t.true(cfg.clientTLSPrivateKeyPath.length > 0 && path.isAbsolute(cfg.clientTLSPrivateKeyPath));
  t.true(cfg.credentialStorePath.length > 0);
  // eslint-disable-next-line max-len
  t.true(cfg.cryptoConfigPath.length > 0 && path.isAbsolute(cfg.cryptoConfigPath) && fs.lstatSync(cfg.cryptoConfigPath).isDirectory());
  t.true(cfg.mspID === 'Org1MSP');
  t.true(Array.isArray(cfg.orderers) && cfg.orderers[0].name === 'orderer.dummy.com'
    && cfg.orderers[0].url.length > 0
    // eslint-disable-next-line max-len
    && cfg.orderers[0].tlsCACertificatePath.length > 0 && path.isAbsolute(cfg.orderers[0].tlsCACertificatePath));
  t.true(Array.isArray(cfg.peers) && cfg.peers[0].name === 'peer0.org1.dummy.com'
    && cfg.peers[0].url.length > 0
    && cfg.peers[0].eventUrl.length > 0
    // eslint-disable-next-line max-len
    && cfg.peers[0].tlsCACertificatePath.length > 0 && path.isAbsolute(cfg.peers[0].tlsCACertificatePath));
  t.true(typeof cfg.profile === 'object' && cfg.profile !== null && cfg.profile !== undefined);
  t.true(cfg.version === '1.0.0');
});
