import axios from 'axios'

const RUBIC_API_URL = 'https://api-v2.rubic.exchange/api'

const api = axios.create({
  baseURL: RUBIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

export interface RubicQuoteParams {
  srcTokenAddress: string
  srcTokenAmount: string
  srcTokenBlockchain: string
  dstTokenAddress: string
  dstTokenBlockchain: string
  fromAddress?: string
}

export interface RubicSwapParams extends RubicQuoteParams {
  id: string
}

export interface RubicRoute {
  id: string
  estimate: {
    destinationTokenAmount: string
    destinationTokenMinAmount: string
    destinationUsdAmount: number
    destinationUsdMinAmount: number
    destinationWeiAmount: string
    destinationWeiMinAmount: string
    durationInMinutes: number
    priceImpact: number
    slippage: number
  }
  fees: {
    gasTokenFees: {
      gas: {
        gasLimit: string
        gasPrice: string
        totalUsdAmount: number
        totalWeiAmount: string
      }
      nativeToken: {
        address: string
        blockchainId: number
        decimals: number
        name: string
        symbol: string
      }
      protocol: {
        fixedAmount: string
        fixedUsdAmount: number
        fixedWeiAmount: string
      }
      provider: {
        fixedAmount: string
        fixedUsdAmount: number
        fixedWeiAmount: string
      }
    }
    percentFees: {
      percent: number
      token: {
        address: string
        blockchainId: number
        decimals: number
        name: string
        symbol: string
      }
    }
  }
  transaction: {
    approvalAddress: string
    data: string
    to: string
    value: string
  }
  swapType: 'cross-chain' | 'on-chain'
  warnings: any[]
}

export class RubicService {
  static async quoteBest(params: RubicQuoteParams): Promise<RubicRoute> {
    try {
      const response = await api.post('/routes/quoteBest', {
        dstTokenAddress: params.dstTokenAddress,
        dstTokenBlockchain: params.dstTokenBlockchain,
        referrer: 'rooswap.exchange',
        srcTokenAddress: params.srcTokenAddress,
        srcTokenAmount: params.srcTokenAmount,
        srcTokenBlockchain: params.srcTokenBlockchain,
        fromAddress: params.fromAddress,
        slippage: 0.03, // 3% default slippage
        enableEstimate: true
      })
      
      if (!response.data) {
        throw new Error('No route found')
      }

      return response.data
    } catch (error: any) {
      console.error('Error getting Rubic quote:', error.response?.data || error.message)
      throw error
    }
  }

  static async getSwapTransaction(params: RubicSwapParams): Promise<RubicRoute> {
    try {
      const response = await api.post('/routes/swap', {
        dstTokenAddress: params.dstTokenAddress,
        dstTokenBlockchain: params.dstTokenBlockchain,
        referrer: 'rooswap.exchange',
        srcTokenAddress: params.srcTokenAddress,
        srcTokenAmount: params.srcTokenAmount,
        srcTokenBlockchain: params.srcTokenBlockchain,
        fromAddress: params.fromAddress,
        id: params.id,
        slippage: 0.03,
        enableEstimate: true
      })
      
      if (!response.data) {
        throw new Error('No swap transaction found')
      }

      return response.data
    } catch (error: any) {
      console.error('Error getting Rubic swap transaction:', error.response?.data || error.message)
      throw error
    }
  }

  static async getStatus(srcTxHash: string) {
    try {
      const response = await api.get(`/info/status?srcTxHash=${srcTxHash}`)
      return response.data
    } catch (error: any) {
      console.error('Error getting Rubic transaction status:', error.response?.data || error.message)
      throw error
    }
  }
}
