import * as fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

class Config {
  constructor(configPath) {
    const sdkConfigPath = !configPath ? process.env.HLF_SDK_CONFIG_PATH : configPath;

    if (!sdkConfigPath) {
      throw new Error('Failed to create Config. Missing requirement "configPath" parameter.');
    }

    this.sdkConfigPath = path.isAbsolute(sdkConfigPath) ? path.resolve(sdkConfigPath)
      : path.resolve(path.join(process.cwd(), sdkConfigPath));
    this.sdkConfigDir = path.dirname(this.sdkConfigPath);
    this.sdkConfig = yaml.safeLoad(fs.readFileSync(this.sdkConfigPath, 'utf8'));

    if (!this.channels.length
        || !this.clientOrganization.length
        || !this.clientTLSCertificatePath.length
        || !this.clientTLSPrivateKeyPath.length
        || !this.cryptoConfigPath.length
        || !this.mspID.length
        || !this.orderers.length
        || !this.peers.length) {
      throw new Error('Invalid HLF sdk configuration');
    }

    const org = this.clientOrganization.toLowerCase();

    this.peers.forEach((peer) => {
      if (peer.name.includes(org)) {
        const index = peer.name.indexOf(org);

        if (index > -1) {
          this.clientOrganizationDomain = peer.name.substring(index, peer.name.length);
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
    // eslint-disable-next-line max-len
    return path.resolve(this.sdkConfigDir, relativeCertPath);
  }

  get adminTLSPrivateKeyPath() {
    // eslint-disable-next-line max-len
    const keystoreDir = `${this.cryptoConfigPath}/peerOrganizations/${this.clientOrganizationDomain}/users/Admin@${this.clientOrganizationDomain}/msp/keystore`;
    // eslint-disable-next-line max-len
    return path.resolve(this.sdkConfigDir, `${keystoreDir}/${fs.readdirSync(path.resolve(this.sdkConfigDir, keystoreDir))[0]}`);
  }

  get channels() {
    return Object.keys(this.sdkConfig.channels);
  }

  get clientOrganization() {
    return this.sdkConfig.client.organization;
  }

  get clientTLSCertificatePath() {
    return path.resolve(this.sdkConfigDir, this.sdkConfig.client.tlsCerts.client.certfile);
  }

  get clientTLSPrivateKeyPath() {
    return path.resolve(this.sdkConfigDir, this.sdkConfig.client.tlsCerts.client.keyfile);
  }

  get cryptoConfigPath() {
    return path.resolve(this.sdkConfigDir, this.sdkConfig.client.cryptoconfig.path);
  }

  get mspID() {
    return this.sdkConfig.organizations[this.clientOrganization].mspid;
  }

  get peers() {
    return Object.keys(this.sdkConfig.peers).map((elem) => ({
      name: elem,
      url: this.sdkConfig.peers[elem].url,
      eventUrl: this.sdkConfig.peers[elem].eventUrl,
      // eslint-disable-next-line max-len
      tlsCACertificatePath: path.resolve(this.sdkConfigDir, this.sdkConfig.peers[elem].tlsCACerts.path),
    }));
  }

  get orderers() {
    return Object.keys(this.sdkConfig.orderers).map((elem) => ({
      name: elem,
      url: this.sdkConfig.orderers[elem].url,
      // eslint-disable-next-line max-len
      tlsCACertificatePath: path.resolve(this.sdkConfigDir, this.sdkConfig.orderers[elem].tlsCACerts.path),
    }));
  }

  get version() {
    return this.sdkConfig.version;
  }
}

export default Config;
