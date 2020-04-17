import * as fs from 'fs';

import { Channel } from 'fabric-client';

const ERROR_CHANNEL_ALREADY_EXISTS = 'version 0, but it is currently at version 1';
const ERROR_CHANNEL_ALREADY_JOINED = 'LedgerID already exists';

class FabricChannels {
  constructor(client, config, orderers, peers) {
    this.channels = new Map();
    this.client = client;
    this.config = config;
    this.orderers = orderers;
    this.peers = peers;
  }

  #channelCreationHandler = async (channelName) => {
    const envelope = fs.readFileSync(`${this.config.channelArtifactsPath}/${channelName}.tx`);
    const channelConfig = this.client.extractChannelConfig(envelope);
    const signature = this.client.signChannelConfig(channelConfig);
    const transactionID = this.client.newTransactionID(true);

    const request = {
      config: channelConfig,
      name: channelName,
      orderer: this.orderers[0].instance,
      signatures: [signature],
      txId: transactionID,
    };

    const response = await this.client.createChannel(request);
    console.log('CREATE CHANNEL RESPONSE ===> ', response);
    const channel = new Channel(channelName, this.client);
    this.channels.set(channelName, channel);

    if (response !== undefined && response !== null && 'info' in response && response.info.includes(ERROR_CHANNEL_ALREADY_EXISTS)) {
      return true;
    }

    return response !== undefined && response !== null && 'status' in response && response.status === 'SUCCESS';
  }

  createChannel = async (name = undefined) => {
    const promises = this.config.channels.map(async (channel) => {
      await this.#channelCreationHandler(channel);
    });

    await Promise.all(promises);
  }

  #channelJoinHandler = async (channelName) => {
    const genesisBlockTxID = this.client.newTransactionID(true);
    const genesisBlockRequest = {
      orderer: this.orderers[0].instance,
      txId: genesisBlockTxID,
    };

    const channel = this.channels.get(channelName);
    const genesisBlock = await channel.getGenesisBlock(genesisBlockRequest);
    const joinChannelTxID = this.client.newTransactionID(true);
    const peers = this.peers.map((peer) => peer.instance);

    const joinChannelRequest = {
      block: genesisBlock,
      targets: peers,
      txId: joinChannelTxID,
    };

    const response = await channel.joinChannel(joinChannelRequest);
    console.log('JOIN CHANNEL RESPONSE ==> ', response);

    if (response[0] instanceof Error && response[0].message.includes(ERROR_CHANNEL_ALREADY_JOINED)) {
      return true;
    }
  }

  joinChannel = async (name = undefined) => {
    const promises = this.config.channels.map(async (channel) => {
      await this.#channelJoinHandler(channel);
    });

    await Promise.all(promises);
  }
}

export default FabricChannels;

