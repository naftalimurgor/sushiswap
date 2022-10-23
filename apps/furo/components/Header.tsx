import { useIsMounted } from '@sushiswap/hooks'
import {Button, Form, Menu, Select, Typography} from '@sushiswap/ui'
import { useRouter } from 'next/router'
import React, {FC} from 'react'
import { useAccount, useConnect } from 'wagmi'
import {Controller, useForm} from "react-hook-form"
import {UserIcon} from "@heroicons/react/solid"

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
    <header className="w-full bg-white h-auto flex flex-col gap-y-[20px] items-center justify-between p-8 md:flex-row md:h-[80px]">
      <Typography variant="h3" weight={600} className="text-typo-primary">
        {`${tabTitle ? tabTitle : ''} ${subTabTitle ? "-" + subTabTitle : ''}`}
      </Typography>
      <div className="flex gap-x-[15px]">
        <Controller
          control={control}
          name="cancelContract"
          render={({field: {onChange, value}, fieldState: {error}}) => (
            <>
              <Select
                button={
                  <Select.Button error={!!error?.message} className="shadow-none w-full bg-input">
                    {value ? value : 'Ethereum'}
                  </Select.Button>
                }
                value={value}
                onChange={onChange}
              >
                <Select.Options>
                  {whoCanCancel.map((person, index) => (
                    <Select.Option key={index} value={person}>
                      {person}
                    </Select.Option>
                  ))}
                </Select.Options>
              </Select>
              <Form.Error message={error?.message}/>
            </>
          )}
        />
        <Button className="w-auto bg-input text-typo-primary hover:ring-0 focus:ring-0">0x 1Eb9...8c99</Button>
        <Button className="w-auto bg-input text-typo-primary hover:ring-0 focus:ring-0">
          <UserIcon width={20} className="text-accent"/>Invite collaborator
        </Button>
      </div>
    </header>
  )
}
