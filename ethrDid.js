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
  verifyJWT(jwt, audience = this.did) {
    let verifiedResponse;
    const ethrResolver = ethr.getResolver();
    const resolver = new Resolver(ethrResolver);
    verifyJWT(jwt, { resolver, audience })
      .then(response => {
        verifiedResponse = response;
        console.log('[EthrDID] verified respone', verifiedResponse);
      })
      .catch(error => console.error('[EthrDID] verifyJWT', error));
  }

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
