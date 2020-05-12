import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';

const endPoints = {
  mainnet: 'https://mainnet.infura.io/v3/ab803204cb9b49adb488de9dd5a06ad9',
  testnet: {
    rpcUrl: 'https://rinkeby.infura.io/v3/de303f7185894e5a862e7482da6e398d',
  },
  localNode: { rpcUrl: 'http://localhost:8546' },
};

const ethrDidResolver = getResolver(endPoints.testnet);
const didResolver = new Resolver(ethrDidResolver);

export async function resolve(did) {
  return await didResolver.resolve(did);
}
