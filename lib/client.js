import * as fs from 'fs';
import Client from 'fabric-client';

import Config from './config';
import FabricChannels from './channel';
import logger from './logger';
import { parseHyperledgerFabricResponsesForLog } from './utils';

class HLFClient {
  // eslint-disable-next-line no-unused-vars
  constructor(connectionProfile, hlfVersion = 1.4) {
    // console.log(hlfVersion);
    this.client = new Client();
    this.config = new Config(connectionProfile);
    this.orderers = [];
    this.peers = [];

    // set crypto suite
    const cryptoSuite = Client.newCryptoSuite();
    const cryptoStore = Client.newCryptoKeyStore({ path: this.config.credentialStorePath });
    cryptoSuite.setCryptoKeyStore(cryptoStore);
    this.client.setCryptoSuite(cryptoSuite);

    // set Admin identity
    const adminCertificate = fs.readFileSync(this.config.adminTLSCertificatePath, 'utf8');
    const adminPrivateKey = fs.readFileSync(this.config.adminTLSPrivateKeyPath, 'utf8');
    this.client.setAdminSigningIdentity(adminPrivateKey, adminCertificate, this.config.mspID);

    // set client TLS certificate and private key
    const clientCertificate = fs.readFileSync(this.config.clientTLSCertificatePath, 'utf8');
    const clientPrivateKey = fs.readFileSync(this.config.clientTLSPrivateKeyPath, 'utf8');
    this.client.setTlsClientCertAndKey(clientCertificate, clientPrivateKey);

    // set orderer(s)
    this.config.orderers.forEach((orderer) => {
      this.orderers.push(
        {
          name: orderer.name,
          instance: this.client.newOrderer(orderer.url, { pem: fs.readFileSync(orderer.tlsCACertificatePath, 'utf8') }),
        },
      );
    });

    // set peer(s)
    this.config.peers.forEach((peer) => {
      this.peers.push(
        {
          name: peer.name,
          instance: this.client.newPeer(peer.url, { pem: fs.readFileSync(peer.tlsCACertificatePath, 'utf8') }),
        },
      );
    });

    this.channelWrapper = new FabricChannels(this.client, this.config, this.orderers, this.peers);
  }

  createChannel = async (name = undefined) => {
    try {
      const responses = await this.channelWrapper.createChannel(name);
      parseHyperledgerFabricResponsesForLog(responses);
    } catch (error) {
      logger.error(error.toString());
      throw error;
    }
  }

  joinChannel = async (name = undefined) => {
    try {
      const responses = await this.channelWrapper.joinChannel(name);
      parseHyperledgerFabricResponsesForLog(responses);
    } catch (error) {
      logger.error(error.toString());
      throw error;
    }
  }
}

export default HLFClient;
