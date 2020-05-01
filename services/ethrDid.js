import EthrDID from 'ethr-did';
import { Resolver } from 'did-resolver';
import ethr from 'ethr-did-resolver';
import didJWT, { verifyJWT } from 'did-jwt';
import { toEthereumAddress } from 'did-jwt/lib/index';
const EC = require('elliptic').ec;
const secp256k1 = new EC('secp256k1');

export default class EthrDid extends EthrDID {
  signer;
  jwk;

  constructor({ provider, address, privateKey, jwk }) {
    console.log('[EthrDID] New EtherDID');
    super({ provider, address, privateKey });
    this.jwk = jwk;
    this.signer = didJWT.SimpleSigner(privateKey);
  }

  static createKeyPair() {
    const kp = secp256k1.genKeyPair();
    const x = kp
      .getPublic()
      .getX()
      .toJSON();
    const y = kp
      .getPublic()
      .getY()
      .toJSON();
    const publicKey = kp.getPublic('hex');
    const privateKey = kp.getPrivate('hex');
    const address = toEthereumAddress(publicKey);
    const kid = `${address}#verikey-1`;
    const crv = 'secp256k1';
    const kty = 'EC';
    const jwk = { crv, x, y, kty, kid };
    return { address, privateKey, jwk };
  }

  //TODO try to remove, unistall resolvers
  async verifyJWT(jwt, audience = this.did) {
    const ethrResolver = ethr.getResolver();
    const resolver = new Resolver(ethrResolver);
    const verifiedJWT = await verifyJWT(jwt, {
      resolver,
      audience
    });
    return verifiedJWT;
  }
}
