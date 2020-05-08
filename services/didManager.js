import Web3 from 'web3';
import HttpProvider from 'ethjs-provider-http';
import EthrDid from './ethrDid';
import fs from 'fs';

const endPoints = {
  mainnet: 'https://mainnet.infura.io/v3/ab803204cb9b49adb488de9dd5a06ad9',
  testnet: 'https://rinkeby.infura.io/v3/de303f7185894e5a862e7482da6e398d',
};

const keyStorePath = './keystore.json';

export default class DIDManager {
  ethrDid;

  constructor(didCallback) {
    if (!!DIDManager.instance) {
      return DIDManager.instance;
    }
    DIDManager.instance = this;
    Web3.providers.HttpProvider.prototype.sendAsync =
      Web3.providers.HttpProvider.prototype.send;
    this.provider = new HttpProvider(endPoints.testnet);
    this.web3 = new Web3(this.provider);

    this.loadDid(didCallback);
  }

  loadDid(callback) {
    try {
      if (fs.existsSync(keyStorePath)) {
        fs.readFile(keyStorePath, (error, data) => {
          if (error) {
            throw error;
          }
          const account = JSON.parse(data);
          this.addEthrAccount(account, false);
          console.log('[DIDManager] DID', this.ethrDid.did);
          if (callback) {
            callback();
          }
        });
      } else {
        this.newEthrDid();
        callback();
      }
    } catch (err) {
      console.error(err);
    }
  }

  newEthrDid() {
    const keypair = EthrDid.createKeyPair();
    console.log('[DidManager] Generated new keypair', keypair);
    this.addEthrAccount(keypair);
  }

  addEthrAccountFromPrivateKey(privateEthrKey) {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateEthrKey);
    this.addEthrAccount(account);
  }

  addEthrAccount(account, store = true) {
    this.ethrDid = new EthrDid({
      provider: this.provider,
      address: account.address,
      privateKey: account.privateKey,
    });
    this.web3.eth.accounts.privateKeyToAccount(account.privateKey);
    console.log(this.web3.eth.accounts);

    if (store) {
      fs.writeFile(keyStorePath, JSON.stringify(account), function (err) {
        if (err) {
          console.log('[DidManager] addEthrAccount', err);
        }
      });
    }
  }

  getDids() {
    return this.ethrDids;
  }
}
