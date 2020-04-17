import * as fs from 'fs';
import { Channel } from 'fabric-client';

const ERROR_BAD_REQUEST = 'BAD_REQUEST';
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
    try {
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

      if (response !== undefined && response !== null
          && 'status' in response && 'info' in response
          && response.status === ERROR_BAD_REQUEST
          && !response.info.includes(ERROR_CHANNEL_ALREADY_EXISTS)) {
        throw new Error(`Failed to create channel ${channelName}: ${response.info}`);
      }

      const channel = new Channel(channelName, this.client);
      this.channels.set(channelName, channel);

      if (response !== undefined && response !== null
        && 'status' in response && 'info' in response
        && response.info.includes(ERROR_CHANNEL_ALREADY_EXISTS)) {
        return { warn: `channel: ${channelName} already exists.` };
      }

      return { info: `channel: ${channelName} has been created.` };
    } catch (error) {
      throw new Error(`Failed to create channel ${channelName}: ${error.message}`);
    }
  }

  // eslint-disable-next-line no-unused-vars
  createChannel = async (name = undefined) => {
    const promises = this.config.channels.map(async (channel) => {
      const response = await this.#channelCreationHandler(channel);
      return response;
    });

    const responses = await Promise.all(promises);
    return responses;
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
    // eslint-disable-next-line max-len
    if (response[0] instanceof Error && response[0].message.includes(ERROR_CHANNEL_ALREADY_JOINED)) {
      return { warn: `channel: ${channelName} already joined.` };
    }

    return { info: `channel: ${channelName} has been joined.` };
  }

  // eslint-disable-next-line no-unused-vars
  joinChannel = async (name = undefined) => {
    const promises = this.config.channels.map(async (channel) => {
      const response = await this.#channelJoinHandler(channel);
      return response;
    });

    const responses = await Promise.all(promises);
    return responses;
  }
}

export default FabricChannels;
