import Web3 from 'web3';
import { resolve } from './resolver';
import EthrDid from './ethrDid';
import fs from 'fs';
import SignerProvider from 'ethjs-provider-signer';
import { sign } from 'ethjs-signer';

const endPoints = {
  mainnet: 'https://mainnet.infura.io/v3/ab803204cb9b49adb488de9dd5a06ad9',
  testnet: 'https://rinkeby.infura.io/v3/de303f7185894e5a862e7482da6e398d',
  localNode: 'http://localhost:8546',
};

const keyStorePath = './keystore.json';
const transactionGas = 210000;

export default class DIDManager {
  ethrDid;

  constructor(didCallback) {
    if (!!DIDManager.instance) {
      return DIDManager.instance;
    }
    DIDManager.instance = this;
    this.web3 = new Web3(new Web3.providers.HttpProvider(endPoints.testnet));
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
    const provider = new SignerProvider(endPoints.testnet, {
      signTransaction: (rawTx, cb) => {
        rawTx.gas = transactionGas;
        console.log('[test]', rawTx);
        cb(null, sign(rawTx, account.privateKey));
      },
    });
    this.ethrDid = new EthrDid({
      provider: provider,
      address: account.address,
      privateKey: account.privateKey,
    });

    if (store) {
      fs.writeFile(keyStorePath, JSON.stringify(account), function (err) {
        if (err) {
          console.log('[DidManager] addEthrAccount', err);
        }
      });
    }
  }

  async getBalance() {
    return await this.web3.eth.getBalance(this.ethrDid.address);
  }

  async resolve() {
    return await resolve(this.ethrDid.did);
  }
}
