import path from 'path';

import test from 'ava';

import createClient from '../lib';

const client = createClient(`${path.resolve(process.cwd())}/tests/fixtures/config/hyperledger-fabric-sdk-config.yaml`);

test.serial('create channel', async (t) => {
  try {
    await client.createChannel();
    t.pass();
  } catch (error) {
    t.fail(error.toString());
  }
});

test.serial('create channel that already exists', async (t) => {
  try {
    await client.createChannel();
    t.pass();
  } catch (error) {
    t.fail(error.toString());
  }
});

test.serial('join channel', async (t) => {
  try {
    await client.joinChannel();
    t.pass();
  } catch (error) {
    t.fail(error.toString());
  }
});

test.serial('join channel that has already been joined', async (t) => {
  try {
    await client.joinChannel();
    t.pass();
  } catch (error) {
    t.fail(error.toString());
  }
});

process.env.GOPATH = `${path.resolve(process.cwd())}/tests`;

test.serial('install simple asset chaincode', async (t) => {
  try {
    await client.installChaincode('sacc', 'hyperledger-fabric-chaincode', 'golang', '1.0');
    t.pass();
  } catch (error) {
    t.fail(error.toString());
  }
});

test.serial('install chaincode already installed', async (t) => {
  try {
    await client.installChaincode('sacc', 'hyperledger-fabric-chaincode', 'golang', '1.0');
    t.pass();
  } catch (error) {
    t.fail(error.toString());
  }
});
