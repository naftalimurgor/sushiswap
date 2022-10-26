import { Signature } from '@ethersproject/bytes'
import { parseUnits } from '@ethersproject/units'
import { yupResolver } from '@hookform/resolvers/yup'
import { Amount, Currency } from '@sushiswap/currency'
import { FundSource } from '@sushiswap/hooks'
import log from '@sushiswap/log'
import { JSBI } from '@sushiswap/math'
import {Button, createToast, Dots, Form, Tab, Typography} from '@sushiswap/ui'
import { BENTOBOX_ADDRESS, useBentoBoxTotal, useFuroStreamRouterContract } from '@sushiswap/wagmi'
import { Approve } from '@sushiswap/wagmi/systems'
import { approveBentoBoxAction, batchAction, streamCreationAction } from 'lib'
import { useNotifications } from 'lib/state/storage'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useAccount, useDeprecatedSendTransaction, useNetwork } from 'wagmi'

import { CreateStreamFormData, CreateStreamFormDataValidated } from '../types'
import { GeneralDetailsSection } from './GeneralDetailsSection'
import { createStreamSchema } from './schema'
import { StreamAmountDetails } from './StreamAmountDetails'
import {CliffDetailsSection, GradedVestingDetailsSection} from "../../vesting";

export const CreateForm: FC = () => {
  const { address } = useAccount()
  const { chain: activeChain } = useNetwork()
  const [error, setError] = useState<string>()
  const contract = useFuroStreamRouterContract(activeChain?.id)
  const [, { createNotification }] = useNotifications(address)
  const { sendTransactionAsync, isLoading: isWritePending } = useDeprecatedSendTransaction()
  const [signature, setSignature] = useState<Signature>()

  const methods = useForm<CreateStreamFormData>({
    // @ts-ignore
    resolver: yupResolver(createStreamSchema),
    defaultValues: {
      currency: undefined,
      startDate: undefined,
      endDate: undefined,
      recipient: undefined,
      amount: '',
      fundSource: FundSource.WALLET,
    },
    mode: 'onChange',
  })

  const {
    formState: { isValid, isValidating },
    watch,
    reset,
  } = methods

  // @ts-ignore
  const [currency, amount] = watch(['currency', 'amount'])

  const amountAsEntity = useMemo<Amount<Currency> | undefined>(() => {
    if (!currency || !amount) return undefined

    let value = undefined
    try {
      value = Amount.fromRawAmount(currency, JSBI.BigInt(parseUnits(String(amount), currency.decimals).toString()))
    } catch (e) {
      console.debug(e)
    }

    return value
  }, [amount, currency])

  const rebase = useBentoBoxTotal(activeChain?.id, amountAsEntity?.currency)

  const onSubmit: SubmitHandler<CreateStreamFormData> = useCallback(
    async (data) => {
      if (!amountAsEntity || !contract || !address || !activeChain?.id || !rebase) return

      // Can cast here safely since input must have been validated already
      const _data = data as CreateStreamFormDataValidated

      setError(undefined)

      const actions = [
        approveBentoBoxAction({ contract, user: address, signature }),
        streamCreationAction({
          contract,
          recipient: _data.recipient,
          currency: _data.currency,
          startDate: new Date(_data.startDate),
          endDate: new Date(_data.endDate),
          amount: amountAsEntity,
          fromBentobox: _data.fundSource === FundSource.BENTOBOX,
          minShare: amountAsEntity.toShare(rebase),
        }),
      ]

      try {
        const data = await sendTransactionAsync({
          request: {
            from: address,
            to: contract?.address,
            data: batchAction({ contract, actions }),
            value: amountAsEntity.currency.isNative ? amountAsEntity.quotient.toString() : '0',
          },
        })
        const ts = new Date().getTime()
        createToast({
          type: 'createStream',
          txHash: data.hash,
          chainId: activeChain.id,
          timestamp: ts,
          groupTimestamp: ts,
          promise: data.wait(),
          summary: {
            pending: (
              <Dots>
                Creating {amountAsEntity?.toSignificant(6)} {amountAsEntity.currency.symbol} stream
              </Dots>
            ),
            completed: `Successfully created a ${amountAsEntity?.toSignificant(6)} ${
              amountAsEntity.currency.symbol
            } stream`,
            failed: 'Something went wrong creating a new stream',
          },
        })

        setSignature(undefined)
      } catch (e: any) {
        setError(e.message)

        log.tenderly({
          chainId: activeChain?.id,
          from: address,
          to: contract.address,
          data: batchAction({ contract, actions }),
          value: amountAsEntity.currency.isNative ? amountAsEntity.quotient.toString() : '0',
        })
      }
    },
    [address, activeChain?.id, amountAsEntity, contract, sendTransactionAsync, signature, rebase]
  )

  useEffect(() => {
    reset()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain?.id, address])

  const SubmitButton = () => {
    return (
      <Form.Buttons className="flex flex-col items-end gap-3">
        <Approve
          className="!items-end"
          components={
            <Approve.Components>
              <Approve.Bentobox address={contract?.address} onSignature={setSignature} />
              <Approve.Token
                amount={amountAsEntity}
                address={activeChain?.id ? BENTOBOX_ADDRESS[activeChain.id] : undefined}
              />
            </Approve.Components>
          }
          onSuccess={createNotification}
          render={({ approved }) => (
            <Button
              type="submit"
              variant="filled"
              disabled={isWritePending || !approved || !isValid || isValidating}
              className="w-full bg-accent"
            >
              {isWritePending ? <Dots>Confirm transaction</Dots> : 'Create stream'}
            </Button>
          )}
        />
      </Form.Buttons>
    );
  }

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={methods.handleSubmit(onSubmit)}>
          <Tab.Group
            as="section"
            className={`z-10 overflow-hidden overflow-x-auto rounded-xl sm:rounded-2xl bg-primary w-1/2`}
            defaultIndex={0}
          >
            <Tab.List className="bg-primary py-8 flex text-center rounded-none border-none">
              <Tab
                as={Typography}
                weight={600}
                size="sm"
                className="bg-transparent focus:text-accent hover:text-accent"
              >
                General Details
              </Tab>
              <Tab
                as={Typography}
                weight={600}
                className="bg-transparent focus:text-accent hover:text-accent"
              >
                Stream Amount
              </Tab>
            </Tab.List>
            <Tab.Panels className="bg-primary px-3 pb-8 text-typo-primary font-bold lg:px-8">
              <Tab.Panel>
                <GeneralDetailsSection />
                <SubmitButton />
              </Tab.Panel>
              <Tab.Panel>
                <StreamAmountDetails />
                <SubmitButton />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </Form>
      </FormProvider>
    </>
  )
}
