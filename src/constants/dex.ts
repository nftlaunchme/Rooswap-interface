import { DexInfo } from '../types/openocean'
import { ethers } from 'ethers'

export const CRONOS_DEXES: { [key: string]: DexInfo } = {
  VVS_V3: {
    name: 'VVS V3',
    routerAddress: ethers.utils.getAddress('0x88d6757C6303f94B11Bfd23087383e871B938780'),
    quoterAddress: ethers.utils.getAddress('0x40aB11c64E9fF5368F09343Ac860dAfA34e14C35'),
    factory: ethers.utils.getAddress('0x40aB11c64E9fF5368F09343Ac860dAfA34e14C35'),
    gasEstimate: '100000',
  },
  VVS_V2: {
    name: 'VVS V2',
    routerAddress: ethers.utils.getAddress('0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae'),
    factory: ethers.utils.getAddress('0x3B44B2a187a7b3824131F8db5a74194D0a42Fc15'),
    gasEstimate: '150000',
  },
  CRONA: {
    name: 'CronaSwap',
    routerAddress: ethers.utils.getAddress('0xcd7d16fB918511BF7269eC4f48d61D79Fb26f918'),
    factory: ethers.utils.getAddress('0x73A48f8f521EB31c55c0e1274dB0898dE599Cb11'),
    gasEstimate: '150000',
  },
  CRODEX: {
    name: 'Crodex',
    routerAddress: ethers.utils.getAddress('0xeC0A7a0C2439E8Cb67b992b12ecd020Ea943c7Be'),
    factory: ethers.utils.getAddress('0xe9c29cB475C0ADe80bE0319B74AD112F1e80058F'),
    gasEstimate: '150000',
  },
  MMF: {
    name: 'MM Finance',
    routerAddress: ethers.utils.getAddress('0x145677FC4d9b8F19B5D56d1820c48e0443049a30'),
    factory: ethers.utils.getAddress('0xd590cC180601AEcD6eeADD9B7f2B7611519544f4'),
    gasEstimate: '150000',
  },
  FULCROM: {
    name: 'Fulcrom',
    routerAddress: ethers.utils.getAddress('0xcC46b79eBEaA1D834B707624977Ec261592E0C9a'),
    factory: '', // Factory address not provided
    gasEstimate: '150000',
  },
  EBISUS: {
    name: 'EbisusBay',
    routerAddress: ethers.utils.getAddress('0xa476c97D8d1ec7D263EAfa0039645DBe0cc0a012'),
    factory: ethers.utils.getAddress('0x5f1D751F447236f486F4268b883782897A902379'),
    gasEstimate: '150000',
  },
  PHOTON: {
    name: 'PhotonSwap',
    routerAddress: ethers.utils.getAddress('0x69004509291F4a4021fA169FafdCFc2d92aD02Aa'),
    factory: ethers.utils.getAddress('0x462C98Cae5AffEED576c98A55dAA922604e2D875'),
    gasEstimate: '150000',
  },
  BORED_CANDY: {
    name: 'Bored Candy',
    routerAddress: ethers.utils.getAddress('0xb99978440f310658c5e69d5042724327ef6d3ce7'),
    factory: ethers.utils.getAddress('0x84343b84EEd78228CCFB65EAdEe7659F246023bf'),
    gasEstimate: '150000',
  },
}
