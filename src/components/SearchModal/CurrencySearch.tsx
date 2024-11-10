import { ChainId, Currency, Token, WETH } from '@kyberswap/ks-sdk-core'
import { Trans, t } from '@lingui/macro'
import axios from 'axios'
import { rgba } from 'polished'
import { stringify } from 'querystring'
import { ChangeEvent, KeyboardEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Trash } from 'react-feather'
import { usePrevious } from 'react-use'
import { Flex, Text } from 'rebass'
import ksSettingApi from 'services/ksSetting'
import styled from 'styled-components'

import Column from 'components/Column'
import InfoHelper from 'components/InfoHelper'
import { RowBetween } from 'components/Row'
import { KS_SETTING_API } from 'constants/env'
import { Z_INDEXS } from 'constants/styles'
import { NativeCurrencies } from 'constants/tokens'
import { useActiveWeb3React } from 'hooks'
import { fetchListTokenByAddresses, formatAndCacheToken, useAllTokens, useFetchERC20TokenFromRPC } from 'hooks/Tokens'
import useDebounce from 'hooks/useDebounce'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useTheme from 'hooks/useTheme'
import useToggle from 'hooks/useToggle'
import store from 'state'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { useRemoveUserAddedToken, useUserAddedTokens, useUserFavoriteTokens } from 'state/user/hooks'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { ButtonText, CloseIcon, TYPE } from 'theme'
import { filterTruthy, isAddress } from 'utils'
import { filterTokens } from 'utils/filtering'
import { isTokenNative } from 'utils/tokenInfo'

import CommonBases from './CommonBases'
import CurrencyList from './CurrencyList'
import { useTokenComparator } from './sorting'
import { PaddedColumn, SearchIcon, SearchInput, SearchWrapper, Separator } from './styleds'

enum Tab {
  All,
  Imported,
}

export const ContentWrapper = styled(Column)`
  width: 100%;
  flex: 1 1;
  position: relative;
  padding-bottom: 10px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-bottom: 0px;
  `};
`

const TabButton = styled(ButtonText)`
  height: 32px;
  color: ${({ theme }) => theme.text};
  &[data-active='true'] {
    color: ${({ theme }) => theme.primary};
  }

  :focus {
    text-decoration: none;
  }
`

const ButtonClear = styled.div`
  border-radius: 24px;
  background-color: ${({ theme }) => rgba(theme.subText, 0.2)};
  display: flex;
  align-items: center;
  padding: 5px 10px;
  gap: 5px;
  cursor: pointer;
`

const NoResultWrapper = styled(Column)`
  padding: 20px;
  height: 100%;
`

export const NoResult = ({ msg }: { msg?: ReactNode }) => {
  const theme = useTheme()
  return (
    <NoResultWrapper data-testid="no-token-result">
      <TYPE.main color={theme.text3} textAlign="center" mb="20px">
        {msg || <Trans>No results found.</Trans>}
      </TYPE.main>
    </NoResultWrapper>
  )
}

interface CurrencySearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  setImportToken: (token: Token) => void
  filterWrap?: boolean
  title?: string
  tooltip?: ReactNode
  customChainId?: ChainId
  setTokenToShowInfo: (token: Token) => void
}

const PAGE_SIZE = 20

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen,
  setImportToken,
  customChainId,
  filterWrap = false,
  title,
  tooltip,
  setTokenToShowInfo,
}: CurrencySearchProps) {
  const { chainId: web3ChainId, account } = useActiveWeb3React()
  const chainId = customChainId || web3ChainId
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>(Tab.All)
  const isImportedTab = activeTab === Tab.Imported

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)
  const isQueryValidEVMAddress = !!isAddress(chainId, debouncedQuery)

  const { favoriteTokens, toggleFavoriteToken } = useUserFavoriteTokens(chainId)

  const defaultTokens = useAllTokens(false, chainId)

  const tokenImports = useUserAddedTokens(chainId)
  const [pageCount, setPageCount] = useState(0)
  const [fetchedTokens, setFetchedTokens] = useState<Token[]>(Object.values(defaultTokens))
  const [hasMoreToken, setHasMoreToken] = useState(false)

  const tokenComparator = useTokenComparator(false, customChainId)

  const [commonTokens, setCommonTokens] = useState<(Token | Currency)[]>([])
  const [loadingCommon, setLoadingCommon] = useState(true)

  const tokenImportsFiltered = useMemo(() => {
    return (debouncedQuery ? filterTokens(chainId, tokenImports, debouncedQuery) : tokenImports).sort(tokenComparator)
  }, [debouncedQuery, chainId, tokenImports, tokenComparator])

  const fetchERC20TokenFromRPC = useFetchERC20TokenFromRPC(chainId)

  // input eth => output filter weth, input weth => output filter eth
  const filterWrapFunc = useCallback(
    (token: Currency | undefined) => {
      if (!chainId || !otherSelectedCurrency) return true
      if (filterWrap && otherSelectedCurrency?.equals(WETH[chainId])) {
        return !isTokenNative(token, token?.chainId)
      }
      if (filterWrap && otherSelectedCurrency && isTokenNative(otherSelectedCurrency, otherSelectedCurrency?.chainId)) {
        return !token?.equals(WETH[chainId])
      }
      return true
    },
    [chainId, otherSelectedCurrency, filterWrap],
  )

  const filteredCommonTokens = useMemo(() => {
    return filterTokens(chainId, commonTokens as Token[], debouncedQuery).filter(filterWrapFunc)
  }, [commonTokens, debouncedQuery, chainId, filterWrapFunc])

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (!debouncedQuery) {
      // whitelist token
      return fetchedTokens.sort(tokenComparator).filter(filterWrapFunc)
    }
    return fetchedTokens.filter(filterWrapFunc)
  }, [fetchedTokens, debouncedQuery, tokenComparator, filterWrapFunc])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onCurrencySelect, onDismiss],
  )

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>(null)

  // clear the input on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      inputRef.current?.focus()
    }
  }, [isOpen])

  const listTokenRef = useRef<HTMLDivElement>(null)

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!chainId) return
      const input = event.target.value
      const checksumInput = isAddress(chainId, input)
      setSearchQuery(checksumInput || input)
      if (listTokenRef?.current) listTokenRef.current.scrollTop = 0
    },
    [chainId],
  )

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!chainId || e.key !== 'Enter') return
      const s = searchQuery.toLowerCase().trim()
      const native = NativeCurrencies[chainId]
      if (s === native.symbol?.toLowerCase() || s === native.name?.toLowerCase()) {
        handleCurrencySelect(NativeCurrencies[chainId])
        return
      }
      const totalToken = filteredSortedTokens.length
      if (totalToken && (filteredSortedTokens[0].symbol?.toLowerCase() === s || totalToken === 1)) {
        handleCurrencySelect(filteredSortedTokens[0])
      }
    },
    [chainId, searchQuery, filteredSortedTokens, handleCurrencySelect],
  )

  const handleClickFavorite = useCallback(
    (e: React.MouseEvent, currency: Currency) => {
      if (!chainId) return
      e.stopPropagation()
      const address = currency?.wrapped?.address || (currency as Token)?.address
      if (!address) return

      toggleFavoriteToken({
        chainId,
        address,
      })
    },
    [chainId, toggleFavoriteToken],
  )

  const fetchFavoriteTokenFromAddress = useCallback(async () => {
    try {
      if (!Object.keys(defaultTokens).length) return
      setLoadingCommon(true)
      let result: (Token | Currency)[] = []
      const addressesToFetch: string[] = []

      favoriteTokens?.forEach(address => {
        let token
        Object.entries(defaultTokens).forEach(([add, t]) => {
          if (add.toLowerCase() === address.toLowerCase()) {
            token = t
          }
        })
        if (token) {
          result.push(token)
          return
        }
        addressesToFetch.push(address)
      })

      if (addressesToFetch.length) {
        const tokens = await fetchListTokenByAddresses(addressesToFetch, chainId)
        // Sort the returned token list to match the order of the passed address list
        result = result.concat(
          tokens.sort((x, y) => {
            return addressesToFetch.indexOf(x.wrapped.address) - addressesToFetch.indexOf(y.wrapped.address)
          }),
        )
      }
      setCommonTokens(result)
    } catch (error) {
      console.log('err', error)
    }
    setLoadingCommon(false)
  }, [chainId, favoriteTokens, defaultTokens])

  useEffect(() => {
    fetchFavoriteTokenFromAddress()
  }, [fetchFavoriteTokenFromAddress])

  const abortControllerRef = useRef(new AbortController())
  const fetchListTokens = useCallback(async (page?: number) => {
    const nextPage = (page ?? pageCount) + 1
    let tokens: WrappedTokenInfo[] = []
    if (debouncedQuery && !isImportedTab) {
      abortControllerRef.current.abort()
      abortControllerRef.current = new AbortController()
      
      try {
        if (debouncedQuery && chainId && isAddress(chainId, debouncedQuery)) {
          const { data: token } = await store.dispatch(
            ksSettingApi.endpoints.getTokenByAddress.initiate({ address: debouncedQuery, chainId }),
          )
          tokens = token ? [token as WrappedTokenInfo] : []
        } else {
          const params: { query: string; isWhitelisted?: boolean; pageSize: number; page: number; chainIds: string } = {
            query: debouncedQuery ?? '',
            chainIds: chainId.toString(),
            page: nextPage,
            pageSize: PAGE_SIZE,
          }
          if (!debouncedQuery) {
            params.isWhitelisted = true
          }
          const url = `${KS_SETTING_API}/v1/tokens?${stringify(params)}`

          const response = await axios.get(url, { signal: abortControllerRef.current.signal })
          const { tokens: fetchedTokens = [] } = response.data.data
          tokens = filterTruthy(fetchedTokens.map(formatAndCacheToken))
        }
      } catch (error) {
        console.error('Failed to fetch tokens:', error)
        tokens = []
      }

      if (tokens.length === 0 && isQueryValidEVMAddress) {
        const rawToken = await fetchERC20TokenFromRPC(debouncedQuery)

        if (rawToken) {
          tokens.push(
            new WrappedTokenInfo({
              chainId: rawToken.chainId,
              address: rawToken.address,
              name: rawToken.name || 'Unknown Token',
              decimals: rawToken.decimals,
              symbol: rawToken.symbol || 'UNKNOWN',
            }),
          )
        }
      }
    } else {
      tokens = isImportedTab ? [] : Object.values(defaultTokens)
    }

    setPageCount(nextPage)
    setFetchedTokens(current => (nextPage === 1 ? [] : current).concat(tokens))
    setHasMoreToken(tokens.length === PAGE_SIZE && !!debouncedQuery)
  }, [isImportedTab, chainId, debouncedQuery, defaultTokens, fetchERC20TokenFromRPC, isQueryValidEVMAddress, pageCount])

  const prevQuery = usePrevious(debouncedQuery)
  useEffect(() => {
    if (prevQuery !== debouncedQuery) {
      fetchListTokens(0)
    }
    // need call api when only debouncedQuery change
  }, [debouncedQuery, prevQuery, fetchListTokens])

  const visibleCurrencies: Currency[] = useMemo(() => {
    return isImportedTab || (!isImportedTab && !filteredSortedTokens.length)
      ? tokenImportsFiltered
      : filteredSortedTokens
  }, [isImportedTab, filteredSortedTokens, tokenImportsFiltered])

  const removeToken = useRemoveUserAddedToken()

  const removeImportedToken = useCallback(
    (token: Token) => {
      removeToken(chainId, token.address)
      if (favoriteTokens?.some(el => el.toLowerCase() === token.address.toLowerCase()))
        toggleFavoriteToken({
          chainId,
          address: token.address,
        })
    },
    [chainId, toggleFavoriteToken, removeToken, favoriteTokens],
  )

  const removeAllImportToken = () => {
    tokenImports?.forEach(removeImportedToken)
  }

  return (
    <ContentWrapper>
      <PaddedColumn gap="14px">
        <RowBetween>
          <Text fontWeight={500} fontSize={20} display="flex">
            {title || <Trans>Select a token</Trans>}
            <InfoHelper
              zIndexTooltip={Z_INDEXS.MODAL}
              size={16}
              fontSize={14}
              text={
                tooltip || (
                  <Text>
                    <Trans>
                      Find a token by searching for its name or symbol or by pasting its address below.
                      <br />
                      You can select and trade any token on KyberSwap.
                    </Trans>
                  </Text>
                )
              }
            />
          </Text>
          <CloseIcon onClick={onDismiss} data-testid="close-icon" />
        </RowBetween>
        <Text style={{ color: theme.subText, fontSize: 12 }}>
          <Trans>
            You can search and select <span style={{ color: theme.text }}>any token</span> on KyberSwap.
          </Trans>
        </Text>

        <SearchWrapper>
          <SearchInput
            type="text"
            id="token-search-input"
            data-testid="token-search-input"
            placeholder={t`Search by token name, token symbol or address`}
            value={searchQuery}
            ref={inputRef}
            onChange={handleInput}
            onKeyDown={handleEnter}
            autoComplete="off"
          />
          <SearchIcon size={18} color={theme.border} />
        </SearchWrapper>

        {showCommonBases && (
          <CommonBases
            tokens={filteredCommonTokens}
            handleToggleFavorite={handleClickFavorite}
            onSelect={handleCurrencySelect}
            selectedCurrency={selectedCurrency}
          />
        )}

        <RowBetween>
          <Flex sx={{ columnGap: '24px' }}>
            <TabButton data-active={activeTab === Tab.All} onClick={() => setActiveTab(Tab.All)}>
              <Text as="span" fontSize={14} fontWeight={500}>
                <Trans>All</Trans>
              </Text>
            </TabButton>

            <TabButton data-active={activeTab === Tab.Imported} onClick={() => setActiveTab(Tab.Imported)}>
              <Text as="span" fontSize={14} fontWeight={500}>
                <Trans>Imported</Trans>
              </Text>
            </TabButton>
          </Flex>
        </RowBetween>
      </PaddedColumn>

      <Separator />

      {isImportedTab && visibleCurrencies.length > 0 && (
        <Flex
          justifyContent="space-between"
          alignItems="center"
          style={{ color: theme.subText, fontSize: 12, padding: '15px 20px 10px 20px' }}
        >
          <div>
            <Trans>{visibleCurrencies.length} Custom Tokens</Trans>
          </div>
          <ButtonClear onClick={removeAllImportToken}>
            <Trash size={13} />
            <Trans>Clear All</Trans>
          </ButtonClear>
        </Flex>
      )}

      {visibleCurrencies.length > 0 ? (
        <CurrencyList
          listTokenRef={listTokenRef}
          removeImportedToken={removeImportedToken}
          currencies={visibleCurrencies}
          showImported={isImportedTab}
          handleClickFavorite={handleClickFavorite}
          onCurrencySelect={handleCurrencySelect}
          otherCurrency={otherSelectedCurrency}
          selectedCurrency={selectedCurrency}
          setImportToken={setImportToken}
          loadMoreRows={fetchListTokens}
          hasMore={hasMoreToken}
          customChainId={customChainId}
          setTokenToShowInfo={setTokenToShowInfo}
        />
      ) : (
        <NoResult />
      )}
    </ContentWrapper>
  )
}
