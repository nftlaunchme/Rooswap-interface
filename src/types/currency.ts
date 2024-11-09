interface BaseCurrency {
  chainId: number
  decimals: number
  symbol?: string
  name?: string
}

export interface Token extends BaseCurrency {
  isToken: true
  isNative: false
  address: string
  equals(other: Currency): boolean
  sortsBefore(other: Token): boolean
  wrapped: Token
  getAddress(): string
}

export interface NativeCurrency extends BaseCurrency {
  isNative: true
  isToken: false
  equals(other: Currency): boolean
  wrapped: Token
  getAddress(): string
}

export type Currency = Token | NativeCurrency

export class Fraction {
  readonly numerator: bigint
  readonly denominator: bigint

  constructor(numerator: bigint, denominator: bigint = BigInt(1)) {
    this.numerator = numerator
    this.denominator = denominator
  }

  protected addFraction(other: Fraction): Fraction {
    if (this.denominator === other.denominator) {
      return new Fraction(this.numerator + other.numerator, this.denominator)
    }
    return new Fraction(
      this.numerator * other.denominator + other.numerator * this.denominator,
      this.denominator * other.denominator
    )
  }

  protected subtractFraction(other: Fraction): Fraction {
    if (this.denominator === other.denominator) {
      return new Fraction(this.numerator - other.numerator, this.denominator)
    }
    return new Fraction(
      this.numerator * other.denominator - other.numerator * this.denominator,
      this.denominator * other.denominator
    )
  }

  protected multiplyFraction(other: Fraction): Fraction {
    return new Fraction(
      this.numerator * other.numerator,
      this.denominator * other.denominator
    )
  }

  protected divideFraction(other: Fraction): Fraction {
    return new Fraction(
      this.numerator * other.denominator,
      this.denominator * other.numerator
    )
  }

  toSignificant(significantDigits = 6): string {
    const value = Number(this.numerator) / Number(this.denominator)
    const str = value.toString()
    const [whole, decimal] = str.split('.')
    if (!decimal) return whole
    return `${whole}.${decimal.slice(0, significantDigits)}`
  }

  invert(): Fraction {
    return new Fraction(this.denominator, this.numerator)
  }
}

export class CurrencyAmount<T extends Currency = Currency> extends Fraction {
  readonly currency: T
  readonly decimalScale: bigint
  readonly raw: string

  constructor(currency: T, amount: string | bigint) {
    const quotient = typeof amount === 'string' ? BigInt(amount) : amount
    super(quotient, BigInt(10) ** BigInt(currency.decimals))
    this.currency = currency
    this.decimalScale = BigInt(10) ** BigInt(currency.decimals)
    this.raw = quotient.toString()
  }

  static fromRaw<T extends Currency>(currency: T, raw: string): CurrencyAmount<T> {
    return new CurrencyAmount(currency, raw)
  }

  get quotient(): bigint {
    return this.numerator
  }

  toExact(): string {
    return (Number(this.numerator) / Number(this.denominator)).toString()
  }

  toSignificant(significantDigits = 6): string {
    return super.toSignificant(significantDigits)
  }

  toFixed(decimalPlaces = 6): string {
    const exact = this.toExact()
    const [whole, decimal] = exact.split('.')
    if (!decimal) return whole
    return `${whole}.${decimal.padEnd(decimalPlaces, '0').slice(0, decimalPlaces)}`
  }

  equalTo(other: CurrencyAmount<T>): boolean {
    return this.quotient === other.quotient && this.currency.equals(other.currency)
  }

  add(other: CurrencyAmount<T>): CurrencyAmount<T> {
    if (!this.currency.equals(other.currency)) throw new Error('Currency mismatch')
    const fraction = this.addFraction(other)
    return new CurrencyAmount(this.currency, fraction.numerator)
  }

  subtract(other: CurrencyAmount<T>): CurrencyAmount<T> {
    if (!this.currency.equals(other.currency)) throw new Error('Currency mismatch')
    const fraction = this.subtractFraction(other)
    return new CurrencyAmount(this.currency, fraction.numerator)
  }

  multiply(other: bigint): CurrencyAmount<T> {
    const fraction = this.multiplyFraction(new Fraction(other))
    return new CurrencyAmount(this.currency, fraction.numerator)
  }

  divide(other: bigint): CurrencyAmount<T> {
    const fraction = this.divideFraction(new Fraction(other))
    return new CurrencyAmount(this.currency, fraction.numerator)
  }

  lessThan(other: CurrencyAmount<T>): boolean {
    if (!this.currency.equals(other.currency)) throw new Error('Currency mismatch')
    return this.quotient < other.quotient
  }

  greaterThan(other: CurrencyAmount<T>): boolean {
    if (!this.currency.equals(other.currency)) throw new Error('Currency mismatch')
    return this.quotient > other.quotient
  }

  get wrapped(): CurrencyAmount<Token> {
    if (this.currency.isNative) {
      return new CurrencyAmount(this.currency.wrapped, this.quotient)
    }
    return this as CurrencyAmount<Token>
  }

  get remainder(): CurrencyAmount<T> {
    return new CurrencyAmount(this.currency, this.numerator % this.denominator)
  }

  asFraction(): Fraction {
    return new Fraction(this.numerator, this.denominator)
  }
}

export class Price<TBase extends Currency, TQuote extends Currency> extends Fraction {
  readonly baseToken: TBase
  readonly quoteToken: TQuote

  constructor(baseToken: TBase, quoteToken: TQuote, denominator: string, numerator: string) {
    super(BigInt(numerator), BigInt(denominator))
    this.baseToken = baseToken
    this.quoteToken = quoteToken
  }

  invert(): Price<TQuote, TBase> {
    return new Price(
      this.quoteToken,
      this.baseToken,
      this.numerator.toString(),
      this.denominator.toString()
    )
  }

  toString(): string {
    return this.toSignificant()
  }
}

// Create WCRO token first so we can reference it in NATIVE_TOKEN
const WCRO: Token = {
  isToken: true,
  isNative: false,
  chainId: 25,
  address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
  decimals: 18,
  symbol: 'WCRO',
  name: 'Wrapped CRO',
  equals: function(other: Currency): boolean {
    return !other.isNative && other.getAddress().toLowerCase() === this.address.toLowerCase()
  },
  sortsBefore: function(other: Token): boolean {
    return this.address.toLowerCase() < other.address.toLowerCase()
  },
  wrapped: {} as Token, // Self-referential, set after creation
  getAddress: function(): string {
    return this.address
  }
}

// Set self-referential wrapped property
WCRO.wrapped = WCRO

export const NATIVE_TOKEN: NativeCurrency = {
  isNative: true,
  isToken: false,
  chainId: 25, // Cronos mainnet
  decimals: 18,
  symbol: 'CRO',
  name: 'Cronos',
  equals: function(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  },
  wrapped: WCRO,
  getAddress: function(): string {
    return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  }
}
