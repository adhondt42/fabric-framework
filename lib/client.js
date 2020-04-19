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

  installChaincode = async (id, path, type, version) => {
    try {
      const promisesPeersQueryInstalledChaincodes = this.peers.map(async (peer) => {
        try {
          const result = await this.client.queryInstalledChaincodes(peer.instance, true);
          if (!result.chaincodes.length) {
            return peer.instance;
          }

          let witness = true;
          result.chaincodes.forEach((chaincode) => {
            if (chaincode.name === id && parseFloat(chaincode.version) <= parseFloat(version)) {
              witness = false;
            }
          });

          if (witness) {
            return peer.instance;
          }

          return undefined;
        } catch (error) {
          logger.error(error.toString());
          throw error;
        }
      });

      const results = await Promise.all(promisesPeersQueryInstalledChaincodes);
      const peersForWhichInstallationIsNecessary = results.filter((elem) => elem !== undefined);

      if (!peersForWhichInstallationIsNecessary.length) {
        logger.warn(`chaincode: ${id} at version: ${version} already installed on peers: ${this.peers.map((peer) => peer.name).join(', ')}`);
        return;
      }

      const request = {
        targets: peersForWhichInstallationIsNecessary,
        chaincodeId: id,
        chaincodePath: path,
        chaincodeVersion: version,
        chaincodeType: type,
      };

      const response = await this.client.installChaincode(request);

      // Check whether the operation failed to get the error back to the user correctly
      if (response.length && Array.isArray(response[0])
        && response[0].length && response[0][0] instanceof Error
        && 'status' in response[0][0]
        && response[0][0].status === 500) {
        throw new Error(response[0][0].message);
      }

      logger.info(`chaincode: ${id} at version: ${version} has been installed on peers: ${this.peers.map((peer) => peer.name).join(', ')}`);
    } catch (error) {
      logger.error(error.toString());
      throw error;
    }
  }
}

export default HLFClient;
