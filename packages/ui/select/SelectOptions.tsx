import { Listbox } from '@headlessui/react'
import classNames from 'classnames'
import { FC, forwardRef } from 'react'

import { ExtractProps } from '../types'

export type SelectOptionsProps = ExtractProps<typeof Listbox.Options>

const SelectOptions: FC<SelectOptionsProps> = forwardRef(({ className, ...props }, ref) => {
  return (
    <Listbox.Options
      ref={ref}
      className={classNames(
        className,
        'absolute z-[100] w-full mt-2 bg-input text-typo-primary overflow-auto hide-scrollbar max-h-60 rounded-xl ring-0 ring-opacity-5 border-[1px] border-muted focus:outline-none'
      )}
      {...props}
    />
  )
})

export default SelectOptions
