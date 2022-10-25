import { CheckCircleIcon } from '@heroicons/react/solid'
import { FundSource, useIsMounted } from '@sushiswap/hooks'
import { classNames, DEFAULT_INPUT_BG, Form, Input, Select, Typography } from '@sushiswap/ui'
import { TokenSelector, useBalance, Web3Input } from '@sushiswap/wagmi'
import { useTokens } from 'lib/state/token-lists'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useAccount, useNetwork } from 'wagmi'

import { useCustomTokens } from '../../../lib/state/storage'
import { CreateVestingFormData } from '../types'

export const GeneralDetailsSection = () => {
  const isMounted = useIsMounted()
  const { address } = useAccount()
  const [dialogOpen, setDialogOpen] = useState(false)
  const { control, watch, setValue } = useFormContext<CreateVestingFormData>()
  const { chain: activeChain } = useNetwork()
  const tokenMap = useTokens(activeChain?.id)
  const [customTokenMap, { addCustomToken, removeCustomToken }] = useCustomTokens(activeChain?.id)

  // @ts-ignore
  const currency = watch('currency')

  const { data: balance } = useBalance({ account: address, chainId: activeChain?.id, currency, loadBentobox: true })

  return (
    <Form.Section
      title="General Details"
      description="Furo allows for creating a vested stream using your BentoBox balance."
    >
      <Form.Control label="Token" className="w-full">
        <Controller
          control={control}
          name="currency"
          render={({ field: { onChange }, fieldState: { error } }) => {
            return (
              <>
                <Select.Button
                  error={!!error?.message}
                  standalone
                  className="!cursor-pointer !bg-input shadow-none"
                  onClick={() => setDialogOpen(true)}
                >
                  {currency?.symbol || <span className="text-typo-primary">Select a currency</span>}
                </Select.Button>
                <Form.Error message={error?.message} />
                <TokenSelector
                  open={dialogOpen}
                  variant="dialog"
                  chainId={activeChain?.id}
                  tokenMap={tokenMap}
                  customTokenMap={customTokenMap}
                  onSelect={(currency) => {
                    if (currency.isNative) {
                      setValue('fundSource', FundSource.WALLET)
                    }
                    onChange(currency)
                    setDialogOpen(false)
                  }}
                  currency={currency}
                  onClose={() => setDialogOpen(false)}
                  onAddToken={({ address, chainId, name, symbol, decimals }) =>
                    addCustomToken({ address, name, chainId, symbol, decimals })
                  }
                  onRemoveToken={removeCustomToken}
                />
              </>
            )
          }}
        />
      </Form.Control>
      <div className="flex flex-col gap-6 md:flex-row w-full">
      <Form.Control label="Start date" className='text-typo-primary w-1/2'>
        <Controller
          control={control}
          name="startDate"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <>
                <Input.DatetimeLocal
                  onChange={onChange}
                  value={value}
                  error={!!error?.message}
                  className="!bg-input shadow-none focus:ring-accent focus-within:ring-accent"
                />
                <Form.Error message={error?.message} />
              </>
            )
          }}
        />
      </Form.Control>
      <Form.Control label="Recipient" className="w-1/2">
        <Controller
          control={control}
          name="recipient"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <Web3Input.Ens
                id="ensInput"
                value={value}
                onChange={onChange}
                error={!!error?.message}
                placeholder="Address or ENS Name"
                className="!bg-input shadow-none focus:ring-accent focus-within:ring-accent"
              />
              <Form.Error message={error?.message} />
            </>
          )}
        />
      </Form.Control>
      </div>
      <Form.Control label="Change Funds Source">
        <Controller
          control={control}
          name="fundSource"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                {!currency?.isNative && (
                  <div
                    onClick={() => onChange(FundSource.BENTOBOX)}
                    className={classNames(
                      value === FundSource.BENTOBOX ? '' : 'ring-transparent',
                      DEFAULT_INPUT_BG,
                      'rounded-xl px-5 py-3 cursor-pointer relative flex flex-col justify-center gap-3 min-w-[140px] !bg-input shadow-none'
                    )}
                  >
                    <Typography weight={500} variant="sm" className="!leading-5 tracking-widest text-typo-primary">
                      BentoBox
                    </Typography>
                    <div className="flex flex-col gap-1">
                      <Typography variant="xs" className="text-secondary">Available Balance</Typography>
                      <Typography weight={500} variant="xs" className="text-typo-primary">
                        {isMounted ? (
                          <>
                            {balance?.[FundSource.BENTOBOX] ? balance[FundSource.BENTOBOX].toSignificant(6) : '0.00'}{' '}
                            <span className="text-slate-500">{balance?.[FundSource.BENTOBOX].currency.symbol}</span>
                          </>
                        ) : (
                          <div className="h-4" />
                        )}
                      </Typography>
                    </div>
                    {value === FundSource.BENTOBOX && (
                      <div className="absolute w-5 h-5 top-3 right-3">
                        <CheckCircleIcon className="text-green/70" />
                      </div>
                    )}
                  </div>
                )}
                <div
                  onClick={() => onChange(FundSource.WALLET)}
                  className={classNames(
                    value === FundSource.WALLET ? '' : 'ring-transparent',
                    DEFAULT_INPUT_BG,
                    'ring-0 rounded-xl px-5 py-3 cursor-pointer relative flex flex-col justify-center gap-3 min-w-[140px] !bg-input shadow-none'
                  )}
                >
                  <Typography weight={500} variant="sm" className="!leading-5 tracking-widest text-typo-primary">
                    Wallet
                  </Typography>
                  <div className="flex flex-col gap-1">
                    <Typography variant="xs">Available Balance</Typography>
                    <Typography weight={500} variant="xs" className="text-typo-primary">
                      {isMounted ? (
                        <>
                          {balance?.[FundSource.WALLET] ? balance[FundSource.WALLET].toSignificant(6) : '0.00'}{' '}
                          <span className="text-slate-500">{balance?.[FundSource.WALLET].currency.symbol}</span>
                        </>
                      ) : (
                        <div className="h-4" />
                      )}
                    </Typography>
                  </div>
                  {value === FundSource.WALLET && (
                    <div className="absolute w-5 h-5 top-3 right-3">
                      <CheckCircleIcon className="text-green/70" />
                    </div>
                  )}
                </div>
              </div>
              <Form.Error message={error?.message} />
            </div>
          )}
        />
      </Form.Control>
    </Form.Section>
  )
}
