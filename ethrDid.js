import EthrDID from 'ethr-did';
import { Resolver } from 'did-resolver';
import ethr from 'ethr-did-resolver';
import didJWT, { verifyJWT, createJWT } from 'did-jwt';

export default class EthrDid extends EthrDID {
  signer;

  constructor(args) {
    super(args);
    this.signer = didJWT.SimpleSigner(args.privateKey);
  }

  //TODO try to remove / unistall resolvers
  async verifyJWT(jwt, audience = this.did) {
    const ethrResolver = ethr.getResolver();
    const resolver = new Resolver(ethrResolver);
    const verifiedJWT = await verifyJWT(jwt, {
      resolver,
      audience
    });
    return verifiedJWT;
  }

  //TODO adjust to client implementation
  signJWT(content, aud) {
    const alg = 'ES256K-R';
    const name = 'DIDWebserver';
    const exp = Date.now() / 1000 + 3600;
    let payload = {
      aud,
      exp,
      name
    };
    payload = { ...payload, ...content };
    const options = {
      alg,
      issuer: this.did,
      signer: this.signer
    };
    return createJWT(payload, options);
  }
}
