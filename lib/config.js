import * as fs from 'fs';
import yaml from 'js-yaml';

class Config {
  constructor(path) {
    const sdkConfigPath = !path ? process.env.HLF_SDK_CONFIG_PATH : path;

    if (!sdkConfigPath) {
      throw new Error('Invalid HLF sdk config path');
    }

    this.sdkConfig = yaml.safeLoad(fs.readFileSync(sdkConfigPath, 'utf8'));
  }

  get channels() {
    return Object.keys(this.sdkConfig.channels);
  }

  get clientOrganization() {
    return this.sdkConfig.client.organization;
  }

  get cryptoConfigPath() {
    return this.sdkConfig.client.cryptoconfig.path;
  }

  get mspID() {
    return this.sdkConfig.organizations[this.clientOrganization].mspid;
  }

  get peers() {
    return Object.keys(this.sdkConfig.peers).map((elem) => ({
      name: elem,
      url: this.sdkConfig.peers[elem].url,
      eventUrl: this.sdkConfig.peers[elem].eventUrl,
      tlsCACertificatePath: this.sdkConfig.peers[elem].tlsCACerts.path,
    }));
  }

  get orderers() {
    return Object.keys(this.sdkConfig.orderers).map((elem) => ({
      name: elem,
      url: this.sdkConfig.orderers[elem].url,
      tlsCACertificatePath: this.sdkConfig.orderers[elem].tlsCACerts.path,
    }));
  }

  get version() {
    return this.sdkConfig.version;
  }
}

export default Config;
