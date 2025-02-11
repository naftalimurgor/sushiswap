import { defaultAbiCoder } from '@ethersproject/abi'
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { Signature } from '@ethersproject/bytes'
import { AddressZero, Zero } from '@ethersproject/constants'
import { TransactionRequest } from '@ethersproject/providers'
import { ChainId } from '@sushiswap/chain'
import { Amount, Currency, Native } from '@sushiswap/currency'
import { SushiSwapRouter, Trade, TradeType, Version } from '@sushiswap/exchange'
import { event } from '@sushiswap/gtag'
import { Percent } from '@sushiswap/math'
import { getBigNumber } from '@sushiswap/tines'
import { Button, Dots } from '@sushiswap/ui'
import { isZero } from '@sushiswap/validate'
import {
  Approve,
  BENTOBOX_ADDRESS,
  calculateGasMargin,
  getTridentRouterContractConfig,
  useBentoBoxTotal,
} from '@sushiswap/wagmi'
import { approveMasterContractAction, batchAction, unwrapWETHAction } from 'lib/actions'
import { toHex } from 'lib/functions'
import { useTransactionDeadline } from 'lib/hooks'
import { useRouters } from 'lib/hooks/useRouters'
import { useNotifications, useSettings } from 'lib/state/storage'
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { ProviderRpcError, useAccount, usePrepareSendTransaction, useProvider, useSendTransaction } from 'wagmi'

import { useTrade } from '../TradeProvider'
import { SwapReviewModalBase } from './SwapReviewModalBase'

interface SwapReviewModalLegacy {
  chainId: ChainId
  children({ isWritePending, setOpen }: { isWritePending: boolean; setOpen(open: boolean): void }): ReactNode
  onSuccess(): void
}

interface SwapCall {
  address: string
  calldata: string
  value: string
}

const KLIMA_FEE = Amount.fromRawAmount(Native.onChain(ChainId.POLYGON), '20000000000000000')

const SWAP_DEFAULT_SLIPPAGE = new Percent(50, 10_000) // 0.50%

export const SwapReviewModalLegacy: FC<SwapReviewModalLegacy> = ({ chainId, children, onSuccess }) => {
  const { trade } = useTrade()
  const { address: account } = useAccount()
  const provider = useProvider({ chainId })
  const [, { createNotification }] = useNotifications(account)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>()

  const onSettled = useCallback(
    (data) => {
      if (!trade) return

      const ts = new Date().getTime()

      data.wait().then(() =>
        event({
          action: 'swap',
          label: `${trade.inputAmount.toFixed()} ${
            trade.inputAmount.currency.symbol
          } to ${trade.outputAmount.toFixed()} ${trade.outputAmount.currency.symbol}`,
          category: trade.routeType(),
        })
      )

      createNotification({
        type: 'swap',
        chainId,
        txHash: data.hash,
        promise: data.wait(),
        summary: {
          pending: `Swapping ${trade.inputAmount.toSignificant(6)} ${
            trade.inputAmount.currency.symbol
          } for ${trade.outputAmount.toSignificant(6)} ${trade.outputAmount.currency.symbol}`,
          completed: `Successfully swapped ${trade.inputAmount.toSignificant(6)} ${
            trade.inputAmount.currency.symbol
          } for ${trade.outputAmount.toSignificant(6)} ${trade.outputAmount.currency.symbol}`,
          failed: `Something went wrong when trying to swap ${trade.inputAmount.currency.symbol} for ${trade.outputAmount.currency.symbol}`,
        },
        timestamp: ts,
        groupTimestamp: ts,
      })
    },
    [chainId, createNotification, trade]
  )

  const [request, setRequest] = useState<Partial<TransactionRequest & { to: string }>>({})
  const { config } = usePrepareSendTransaction({
    request,
    chainId,
  })

  const { sendTransaction, isLoading: isWritePending } = useSendTransaction({
    ...config,
    onSettled,
    onSuccess: (data) => {
      console.log(data)
      if (data) {
        setOpen(false)
        onSuccess()
      }
    },
  })

  const [signature, setSignature] = useState<Signature>()

  const [sushiSwapRouter, tridentRouter, sushiSwapKlimaRouter] = useRouters(chainId)

  const deadline = useTransactionDeadline(chainId, open)

  const inputCurrencyRebase = useBentoBoxTotal(chainId, trade?.inputAmount.currency)
  const outputCurrencyRebase = useBentoBoxTotal(chainId, trade?.outputAmount.currency)

  const [{ slippageTolerance, carbonOffset }] = useSettings()

  const allowedSlippage = useMemo(
    () => (slippageTolerance ? new Percent(slippageTolerance * 100, 10_000) : SWAP_DEFAULT_SLIPPAGE),
    [slippageTolerance]
  )

  const prepare = useCallback(async () => {
    try {
      if (!trade || !account) return
      let call: SwapCall | null = null
      let value = '0x0'

      if (sushiSwapRouter && trade.isV1()) {
        const swapCallParameters = SushiSwapRouter.swapCallParameters(
          trade as Trade<Currency, Currency, TradeType, Version.V1>,
          {
            feeOnTransfer: false,
            allowedSlippage,
            // TODO: custom recipient
            recipient: account,
            deadline: deadline.toNumber(),
          }
        )

        const { methodName, args } = swapCallParameters

        // value = swapCallParameters.value

        const shouldCarbonOffset = chainId === ChainId.POLYGON && carbonOffset

        if (trade.inputAmount.currency.isNative) {
          value = toHex(shouldCarbonOffset ? trade.inputAmount.add(KLIMA_FEE) : trade.inputAmount)
        } else if (shouldCarbonOffset) {
          value = toHex(KLIMA_FEE)
        }

        call = {
          address: shouldCarbonOffset && sushiSwapKlimaRouter ? sushiSwapKlimaRouter.address : sushiSwapRouter.address,
          calldata: sushiSwapRouter.interface.encodeFunctionData(methodName, args),
          value,
        }
      } else if (tridentRouter && trade.isV2()) {
        if (!inputCurrencyRebase || !outputCurrencyRebase) return

        const actions = [approveMasterContractAction({ router: tridentRouter, signature })]

        if (trade.isSinglePool()) {
          actions.push(
            tridentRouter.interface.encodeFunctionData('exactInputSingleWithNativeToken', [
              {
                tokenIn: trade.inputAmount.currency.isNative ? AddressZero : trade.inputAmount.currency.wrapped.address,
                amountIn: BigNumber.from(trade.inputAmount.quotient.toString()),
                amountOutMinimum: BigNumber.from(
                  trade.minimumAmountOut(allowedSlippage).toShare(outputCurrencyRebase).quotient.toString()
                ),
                pool: trade.route.legs[0].poolAddress,
                data: defaultAbiCoder.encode(
                  ['address', 'address', 'bool'],
                  [
                    trade.route.legs[0].tokenFrom.address,
                    trade.outputAmount.currency.isNative ? tridentRouter.address : account,
                    true,
                  ]
                ),
              },
            ])
          )
        } else if (trade.isSingle()) {
          actions.push(
            tridentRouter.interface.encodeFunctionData('exactInputWithNativeToken', [
              {
                tokenIn: trade.inputAmount.currency.isNative ? AddressZero : trade.inputAmount.currency.wrapped.address,
                amountIn: BigNumber.from(trade.inputAmount.quotient.toString()),
                amountOutMinimum: BigNumber.from(
                  trade.minimumAmountOut(allowedSlippage).toShare(outputCurrencyRebase).quotient.toString()
                ),
                path: trade.route.legs.map((leg, i) => {
                  const isLastLeg = i === trade.route.legs.length - 1
                  return {
                    pool: leg.poolAddress,
                    data: defaultAbiCoder.encode(
                      ['address', 'address', 'bool'],
                      [
                        leg.tokenFrom.address,
                        isLastLeg
                          ? trade.outputAmount.currency.isNative
                            ? tridentRouter.address
                            : account
                          : trade.route.legs[i + 1].poolAddress,
                        isLastLeg,
                      ]
                    ),
                  }
                }),
              },
            ])
          )
        } else if (trade.isComplex()) {
          // complex trade
          const initialPathCount = trade.route.legs.filter(
            (leg) => leg.tokenFrom.address === trade.inputAmount.currency.wrapped.address
          ).length
          const [initialPath, percentagePath, output] = trade.route.legs.reduce<
            [
              {
                tokenIn: string
                pool: string
                native: boolean
                amount: BigNumberish
                data: string
              }[],
              {
                tokenIn: string
                pool: string
                balancePercentage: BigNumberish
                data: string
              }[],
              {
                token: string
                to: string
                unwrapBento: boolean
                minAmount: BigNumberish
              }[]
            ]
          >(
            ([initialPath, percentagePath, output], leg, i) => {
              const isInitialPath = leg.tokenFrom.address === trade.inputAmount.currency.wrapped.address
              if (isInitialPath) {
                return [
                  [
                    ...initialPath,
                    {
                      tokenIn: trade.inputAmount.currency.isNative ? AddressZero : leg.tokenFrom.address,
                      pool: leg.poolAddress,
                      amount:
                        initialPathCount > 1 && i === initialPathCount - 1
                          ? BigNumber.from(trade.inputAmount.quotient.toString()).sub(
                              initialPath.reduce(
                                (previousValue, currentValue) => previousValue.add(currentValue.amount),
                                Zero
                              )
                            )
                          : BigNumber.from(trade.inputAmount.quotient.toString())
                              .mul(Math.round(leg.absolutePortion * 1e6))
                              .div(1e6),
                      native: true,
                      data: defaultAbiCoder.encode(
                        ['address', 'address', 'bool'],
                        [
                          leg.tokenFrom.address,
                          getTridentRouterContractConfig(trade.inputAmount.currency.chainId).addressOrName,
                          false,
                        ]
                      ),
                    },
                  ],
                  percentagePath,
                  output,
                ]
              } else {
                return [
                  initialPath,
                  [
                    ...percentagePath,
                    {
                      tokenIn: leg.tokenFrom.address,
                      pool: leg.poolAddress,
                      balancePercentage: getBigNumber(leg.swapPortion * 10 ** 8),
                      data: defaultAbiCoder.encode(
                        ['address', 'address', 'bool'],
                        [
                          leg.tokenFrom.address,
                          getTridentRouterContractConfig(trade.inputAmount.currency.chainId).addressOrName,
                          false,
                        ]
                      ),
                    },
                  ],
                  output,
                ]
              }
            },
            [
              [],
              [],
              [
                {
                  token: trade.outputAmount.currency.wrapped.address,
                  to: trade.outputAmount.currency.isNative ? tridentRouter.address : account,
                  unwrapBento: true,
                  minAmount: trade
                    ?.minimumAmountOut(allowedSlippage)
                    ?.toShare(outputCurrencyRebase)
                    .quotient.toString(),
                },
              ],
            ]
          )
          actions.push(
            tridentRouter.interface.encodeFunctionData('complexPath', [{ initialPath, percentagePath, output }])
          )
        }

        if (trade.inputAmount.currency.isNative) {
          value = toHex(trade.inputAmount)
        }
        if (trade.outputAmount.currency.isNative) {
          // unwrap
          actions.push(
            unwrapWETHAction({
              chainId,
              router: tridentRouter,
              recipient: account,
              amountMinimum: trade?.minimumAmountOut(allowedSlippage).quotient.toString(),
            })
          )
        }

        call = {
          address: tridentRouter.address,
          calldata: batchAction({
            contract: tridentRouter,
            actions,
          }),
          value,
        }
      }
      if (call) {
        const tx =
          !value || isZero(value)
            ? { from: account, to: call.address, data: call.calldata }
            : {
                from: account,
                to: call.address,
                data: call.calldata,
                value,
              }

        const estimatedCall = await provider
          .estimateGas(tx)
          .then((gasEstimate) => {
            return {
              call,
              gasEstimate,
            }
          })
          .catch((gasError) => {
            console.debug('Gas estimate failed, trying eth_call to extract error', call)

            return provider
              .call(tx)
              .then((result) => {
                console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
                return {
                  call,
                  error: new Error('Unexpected issue with estimating the gas. Please try again.'),
                }
              })
              .catch((callError) => {
                console.debug('Call threw error', call, callError)
                return {
                  call,
                  error: new Error(callError),
                  // error: new Error(swapErrorToUserReadableMessage(callError)),
                }
              })
          })

        setRequest({
          ...tx,
          ...('gasEstimate' in estimatedCall ? { gasLimit: calculateGasMargin(estimatedCall.gasEstimate) } : {}),
        })
      }
    } catch (e: unknown) {
      if (e instanceof ProviderRpcError) {
        setError(e.message)
      }

      console.log(e)
    }
  }, [
    account,
    allowedSlippage,
    carbonOffset,
    chainId,
    deadline,
    inputCurrencyRebase,
    outputCurrencyRebase,
    provider,
    signature,
    sushiSwapKlimaRouter,
    sushiSwapRouter,
    trade,
    tridentRouter,
  ])

  // Prepare transaction
  useEffect(() => {
    void prepare()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trade])

  const [input0, input1] = useMemo(
    () => [trade?.inputAmount, trade?.outputAmount],
    [trade?.inputAmount, trade?.outputAmount]
  )

  const approveTokenTo = useMemo(() => {
    if (trade?.isV1()) {
      return chainId === ChainId.POLYGON && carbonOffset ? sushiSwapKlimaRouter?.address : sushiSwapRouter?.address
    } else if (trade?.isV2()) {
      return BENTOBOX_ADDRESS[chainId]
    }
  }, [trade, carbonOffset, sushiSwapKlimaRouter?.address, sushiSwapRouter?.address, chainId])

  return (
    <>
      {children({ isWritePending, setOpen })}
      <SwapReviewModalBase
        chainId={chainId}
        input0={input0}
        input1={input1}
        open={open}
        setOpen={setOpen}
        error={error}
      >
        <Approve
          onSuccess={createNotification}
          className="flex-grow !justify-end"
          components={
            <Approve.Components>
              <Approve.Bentobox
                size="md"
                className="whitespace-nowrap"
                fullWidth
                address={getTridentRouterContractConfig(chainId).addressOrName}
                onSignature={setSignature}
                enabled={Boolean(getTridentRouterContractConfig(chainId).addressOrName)}
              />
              <Approve.Token
                size="md"
                className="whitespace-nowrap"
                fullWidth
                amount={input0}
                address={approveTokenTo}
              />
            </Approve.Components>
          }
          render={({ approved }) => {
            return (
              <Button size="md" disabled={!approved || isWritePending} fullWidth onClick={() => sendTransaction?.()}>
                {isWritePending ? <Dots>Confirm Swap</Dots> : 'Swap'}
              </Button>
            )
          }}
        />
      </SwapReviewModalBase>
    </>
  )
}
