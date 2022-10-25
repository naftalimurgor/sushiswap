import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon, ExternalLinkIcon } from '@heroicons/react/outline'
import useScrollPosition from '@react-hook/window-scroll'
import { useIsMounted } from '@sushiswap/hooks'
import React, { Fragment } from 'react'

import { classNames, Container, Link, MaxWidth, Select, SushiIcon, Typography, useBreakpoint } from '..'

export enum AppType {
  Root = 'Explore Apps',
  Swap = 'Swap',
  xSwap = 'xSwap',
  Furo = 'Streaming',
  Blog = 'Blog',
  Legacy = 'Sushi 1.0',
  Internal = 'Internal',
  Kashi = 'Lend & Borrow',
  Analytics = 'Analytics',
  Invest = 'Earn',
  Partner = 'Partner',
}

const LINK = {
  [AppType.Swap]: '/swap',
  [AppType.xSwap]: '/xswap',
  [AppType.Furo]: '/furo',
  [AppType.Blog]: '/blog',
  [AppType.Legacy]: '/',
  [AppType.Internal]: '/internal',
  [AppType.Kashi]: '/kashi',
  [AppType.Analytics]: '/analytics',
  [AppType.Invest]: '/earn',
  [AppType.Partner]: '/partner',
}

export interface HeaderProps extends React.HTMLProps<HTMLElement> {
  nav?: JSX.Element
  withScrollBackground?: boolean
  appType: AppType
  maxWidth?: MaxWidth
}

export function Header({
  children,
  appType,
  className,
  nav,
  withScrollBackground = false,
  maxWidth = '5xl',
  ...props
}: HeaderProps): JSX.Element {
  const isMounted = useIsMounted()
  const scrollY = useScrollPosition()

  const { isMd } = useBreakpoint('md')

  // Show when:
  // 1. We scroll down for 45px
  // 2. When body has a negative top set for body lock for Dialogs on small screens
  const showBackground =
    (scrollY > 45 && withScrollBackground && isMounted) ||
    (typeof window !== 'undefined' && !isMd
      ? Number(document.body.style.top.slice(0, -2)) < 0 && withScrollBackground
      : false)

  return (
    <header
      className={classNames('sticky mt-0 flex items-center left-0 right-0 top-0 w-full z-[1070] h-[54px]', className)}
      {...props}
    >

      <Container
        maxWidth={maxWidth}
        className={classNames('items-end w-full mx-auto z-[101]')}
      >
        <div className="flex justify-center">{nav}</div>
        <div className="flex justify-end">{children}</div>
      </Container>
    </header>
  )
}

export default Header
