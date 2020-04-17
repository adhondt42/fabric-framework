import test from 'ava';
import createClient from '../lib';

function createTestClient() {
  return createClient('/home/tests/fixtures/config/hyperledger-fabric-sdk-config.yaml');
}

test.beforeEach((t) => {
  const client = createTestClient();
  // eslint-disable-next-line no-param-reassign
  t.context.client = client;
});

test.serial('create channel', async (t) => {
  const { client } = t.context;
  t.notThrows(async () => {
    await client.createChannel();
  });
});
