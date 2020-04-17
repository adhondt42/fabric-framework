import * as fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const required = [
  'channelArtifactsPath',
  'channels',
  'clientOrganization',
  'clientTLSCertificatePath',
  'clientTLSPrivateKeyPath',
  'credentialStorePath',
  'cryptoConfigPath',
  'mspID',
  'orderers',
  'peers',
];

class Config {
  constructor(connectionProfile) {
    let connectionProfilePath = !connectionProfile
      ? process.env.HLF_SDK_CONFIG_PATH : connectionProfile;

    if (!connectionProfilePath) {
      throw new Error('Failed to create Config. Missing requirement "connectionProfile" parameter.');
    }

    connectionProfilePath = path.isAbsolute(connectionProfilePath)
      ? path.resolve(connectionProfilePath)
      : path.resolve(path.join(process.cwd(), connectionProfilePath));

    this.connectionProfileLocation = path.dirname(connectionProfilePath);
    this.connectionProfile = yaml.safeLoad(fs.readFileSync(connectionProfilePath, 'utf8'));

    // ensure that every required information is present in connection profile
    required.forEach((it) => {
      if (!this[it].length) {
        throw new Error(`Invalid HLF connection profile. Missing requirement "${it}"`);
      }
    });

    // try to resolve client organization domain
    const org = this.clientOrganization.toLowerCase();
    this.peers.forEach((peer) => {
      if (peer.name.includes(org)) {
        if (peer.name.indexOf(org) > -1) {
          // eslint-disable-next-line max-len
          this.clientOrganizationDomain = peer.name.substring(peer.name.indexOf(org), peer.name.length);
        }
      }
    });

    if (!this.clientOrganizationDomain || !this.clientOrganizationDomain.length) {
      throw new Error('Failed to resolve client organization domain');
    }
  }

  get adminTLSCertificatePath() {
    // eslint-disable-next-line max-len
    const relativeCertPath = `${this.cryptoConfigPath}/peerOrganizations/${this.clientOrganizationDomain}/users/Admin@${this.clientOrganizationDomain}/msp/signcerts/Admin@${this.clientOrganizationDomain}-cert.pem`;
    return path.resolve(this.connectionProfileLocation, relativeCertPath);
  }

  get adminTLSPrivateKeyPath() {
    // eslint-disable-next-line max-len
    const keystoreDir = `${this.cryptoConfigPath}/peerOrganizations/${this.clientOrganizationDomain}/users/Admin@${this.clientOrganizationDomain}/msp/keystore`;
    // eslint-disable-next-line max-len
    return path.resolve(this.connectionProfileLocation, `${keystoreDir}/${fs.readdirSync(path.resolve(this.connectionProfileLocation, keystoreDir))[0]}`);
  }

  get channelArtifactsPath() {
    // eslint-disable-next-line max-len
    return path.resolve(this.connectionProfileLocation, this.connectionProfile.client.channelArtifacts.path);
  }

  get channels() {
    return Object.keys(this.connectionProfile.channels);
  }

  get clientOrganization() {
    return this.connectionProfile.client.organization;
  }

  get clientTLSCertificatePath() {
    // eslint-disable-next-line max-len
    return path.resolve(this.connectionProfileLocation, this.connectionProfile.client.tlsCerts.client.certfile);
  }

  get clientTLSPrivateKeyPath() {
    // eslint-disable-next-line max-len
    return path.resolve(this.connectionProfileLocation, this.connectionProfile.client.tlsCerts.client.keyfile);
  }

  get credentialStorePath() {
    return this.connectionProfile.client.credentialStore.path;
  }

  get cryptoConfigPath() {
    // eslint-disable-next-line max-len
    return path.resolve(this.connectionProfileLocation, this.connectionProfile.client.cryptoconfig.path);
  }

  get mspID() {
    return this.connectionProfile.organizations[this.clientOrganization].mspid;
  }

  get peers() {
    return Object.keys(this.connectionProfile.peers).map((elem) => ({
      name: elem,
      url: this.connectionProfile.peers[elem].url,
      eventUrl: this.connectionProfile.peers[elem].eventUrl,
      // eslint-disable-next-line max-len
      tlsCACertificatePath: path.resolve(this.connectionProfileLocation, this.connectionProfile.peers[elem].tlsCACerts.path),
    }));
  }

  get profile() {
    return this.connectionProfile;
  }

  get orderers() {
    return Object.keys(this.connectionProfile.orderers).map((elem) => ({
      name: elem,
      url: this.connectionProfile.orderers[elem].url,
      // eslint-disable-next-line max-len
      tlsCACertificatePath: path.resolve(this.connectionProfileLocation, this.connectionProfile.orderers[elem].tlsCACerts.path),
    }));
  }

  get version() {
    return this.connectionProfile.version;
  }
}

export default Config;
