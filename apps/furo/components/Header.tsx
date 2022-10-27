import React, {FC} from 'react'
import { useIsMounted } from '@sushiswap/hooks'
import { useRouter } from 'next/router'
import { useAccount, useConnect } from 'wagmi'
import { Wallet } from '@sushiswap/wagmi'
import { SUPPORTED_CHAINS } from 'config'
import Link from 'next/link'
import {Controller, useForm} from "react-hook-form"
import {App, Button, Form, Menu, Select, Typography} from '@sushiswap/ui'
import { AppType } from '@sushiswap/ui/app/Header'
import {UserIcon} from "@heroicons/react/solid"
import { PaperAirplaneIcon } from '@heroicons/react/outline'

type props = {
  tabTitle: string;
  subTabTitle?: string;
}

const whoCanCancel = ["Ethereum", "Ethereum", "Ethereum", "Ethereum"];

export const Header: FC = ({tabTitle, subTabTitle} : props) => {
  const isMounted = useIsMounted()
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const {control} = useForm()

  const connect = useConnect({
    onSuccess: () => {
      if (router.pathname === '/') {
        void router.push('/dashboard')
      }
    },
  })

  return (
    <>
      <App.Header
        appType={AppType.Furo}
        className={'w-full bg-white h-auto flex flex-col gap-y-[20px] items-center justify-between px-8 py-4 md:flex-row md:h-[80px]'}
        withScrollBackground={router.pathname === '/'}
        maxWidth="full"
      >
        <Typography variant="h3" weight={600} className="text-typo-primary">
          {`${tabTitle ? tabTitle : ''} ${subTabTitle ? "-" + subTabTitle : ''}`}
        </Typography>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Wallet.Button
            size="md"
            hack={connect}
            supportedNetworks={SUPPORTED_CHAINS}
            className="!bg-input hover:!bg-accent text-typo-primary hover:text-white hover:ring-0 focus:ring-accent"
          />
          {address && isMounted && isConnected && (
            <Menu
              button={
                <Menu.Button
                  color="blue"
                  fullWidth
                  startIcon={<PaperAirplaneIcon width={18} className="transform rotate-45 -mt-0.5" />}
                  size="sm"
                  as="div"
                >
                  Pay Someone
                </Menu.Button>
              }
            >
              <Menu.Items unmount={false} className="!min-w-0">
                <Link passHref={true} href="/stream/create">
                  <Menu.Item as="a">Stream</Menu.Item>
                </Link>
                <Link passHref={true} href="/vesting/create">
                  <Menu.Item as="a">Vesting</Menu.Item>
                </Link>
              </Menu.Items>
            </Menu>
          )}
        </div>
      </App.Header>
      </>
  )
}
