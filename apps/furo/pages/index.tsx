import { AddressZero } from '@ethersproject/constants'
import { Chain, ChainId } from '@sushiswap/chain'
import { shortenAddress } from '@sushiswap/format'
import { useIsMounted } from '@sushiswap/hooks'
import { Button, Typography } from '@sushiswap/ui'
import { Account, Wallet } from '@sushiswap/wagmi'
import { BackgroundVector, Layout } from 'components'
import { SUPPORTED_CHAINS } from 'config'
import { FuroStatus, FuroType, Stream } from 'lib'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAccount, useConnect, useNetwork } from 'wagmi'

import { BalanceChart } from '../components/stream'
import { ChartHover } from '../types'

const now = new Date().getTime()

const exampleStream = new Stream({
  chainId: ChainId.ETHEREUM,
  furo: {
    id: '0',
    __typename: FuroType.STREAM,
    status: FuroStatus.ACTIVE,
    remainingShares: '50000000000',
    initialShares: '119940000000',
    initialAmount: '117994000000',
    initialSharesExtended: '0',
    extendedShares: '0',
    withdrawnAmount: '69308282750',
    withdrawnAmountAfterExtension: '0',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    recipient: { id: AddressZero },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    createdBy: { id: AddressZero },
    expiresAt: Math.floor(new Date(now + 60 * 60 * 24 * 3).getTime() / 1000).toString(),
    startedAt: Math.floor(new Date(now - 60 * 60 * 24 * 7).getTime() / 1000).toString(),
    modifiedAtTimestamp: Math.floor(new Date(now - 60 * 60 * 24 * 3).getTime() / 1000).toString(),
    extendedAtTimestamp: Math.floor(new Date().getTime() / 1000).toString(),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    token: {
      name: 'USDC',
      decimals: '6',
      symbol: 'USDC',
      id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    },
    txHash: '',
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  rebase: {
    base: '1',
    elastic: '1',
  },
})

export default function Index() {
  const router = useRouter()
  const isMounted = useIsMounted()
  const { address } = useAccount()
  const { chain: activeChain } = useNetwork()
  const [hover, setHover] = useState<ChartHover>(ChartHover.NONE)

  const paySomeone = useConnect({
    onSuccess: ({ chain }) => {
      if (SUPPORTED_CHAINS.includes(chain.id)) {
        void router.push('/stream/create')
      }
    },
  })

  const viewEarnings = useConnect({
    onSuccess: ({ chain }) => {
      if (SUPPORTED_CHAINS.includes(chain.id)) {
        void router.push('/dashboard')
      }
    },
  })

  return (
    <div className="text-center font-medium text-4xl sm:text-5xl font-stretch leading-[1.125] tracking-[-0.06rem] p-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 w-full">
      <span className="text-typo-primary">Kynos</span> is <br />Coming Soon
    </div>
  )
}
