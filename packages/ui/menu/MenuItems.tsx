import { Menu as HeadlessMenu } from '@headlessui/react'
import React, { forwardRef } from 'react'

import { classNames } from '../index'
import { ExtractProps } from '../types'

export type MenuItems = ExtractProps<typeof HeadlessMenu.Items> & {
  className?: string
}

export const MenuItems: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<MenuItems> & React.RefAttributes<HTMLDivElement>
> = forwardRef<HTMLDivElement, MenuItems>(({ className, ...props }, ref) => {
  return (
    <HeadlessMenu.Items
      {...props}
      ref={ref}
      className={classNames(
        className,
        'bg-white absolute right-0 mt-0 min-w-[224px] w-[fit-content] w-full rounded-xl ring-0 shadow-sm shadow-slate-300 focus:outline-none'
      )}
    />
  )
})
