import React, { FC } from 'react'

import { Typography } from '../typography'
import { FormControl } from './FormControl'

interface FormSection {
  title: string
  description: string
  children: React.ReactElement<typeof FormControl> | React.ReactElement<typeof FormControl>[] | undefined | null | false
}

export const FormSection: FC<FormSection> = ({ title, description, children }) => {
  return (
    <div className="flex flex-col gap-y-10 py-2">
      <div>
        <Typography variant="lg" weight={600} className="text-typo-primary dark:text-typo-primary">
          {title}
        </Typography>
        <Typography variant="sm" className="text-slate-400 dark:text-typo-secondary">
          {description}
        </Typography>
      </div>
      <div className="space-y-6 flex flex-row flex-wrap items-start">{children}</div>
    </div>
  )
}
