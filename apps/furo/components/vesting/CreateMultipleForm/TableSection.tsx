import { PlusIcon } from '@heroicons/react/solid'
import { Button, classNames, Typography } from '@sushiswap/ui'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { stepConfigurations } from '../CreateForm'
import { CreateMultipleVestingFormData } from '../types'
import { TableSectionRow } from './TableSectionRow'

export const TableSection = () => {
  const { control, watch } = useFormContext<CreateMultipleVestingFormData>()

  // TODO: cast as never until
  // https://github.com/react-hook-form/react-hook-form/issues/4055#issuecomment-950145092 gets fixed
  const { append, remove } = useFieldArray({
    control,
    name: 'vestings',
    shouldUnregister: true,
  } as never)

  // @ts-ignore
  const fields = watch('vestings')

  return (
    <div className="">
      <div className="w-full max-w-5xl">
        <div
          className={classNames(
            fields?.length === 0 ? 'rounded-2xl' : 'rounded-t-2xl',
            'bg-white rounded-t-xl grid grid-cols-[100px_160px_100px_160px_160px_160px_40px] gap-y-3 gap-x-2 py-[18px] px-6 shadow-sm'
          )}
        >
          <Typography variant="sm" weight={500} className="text-typo-primary">
            Currency
          </Typography>
          <Typography variant="sm" weight={500} className="text-typo-primary">
            Recipient
          </Typography>
          <Typography variant="sm" weight={500} className="text-typo-primary">
            Source
          </Typography>
          <Typography variant="sm" weight={500} className="text-typo-primary">
            Start Date
          </Typography>
          <Typography variant="sm" weight={500} className="text-typo-primary">
            Total Amount
          </Typography>
          <Typography variant="sm" weight={500} className="text-typo-primary">
            Vesting Schedule
          </Typography>
          <span />
        </div>
        <div className="flex flex-col rounded-b-2xl bg-secondary">
          {fields?.map((field, index) => (
            <TableSectionRow
              index={index}
              key={index}
              control={control}
              onRemove={remove}
              onCopy={append}
              last={fields?.length === index + 1}
            />
          ))}
        </div>
        <div className="flex px-2 mt-3">
          <Button
            className="ml-auto !ring-0"
            type="button"
            variant="filled"
            size="sm"
            startIcon={<PlusIcon width={16} height={16} />}
            onClick={() =>
              append({
                currency: undefined,
                cliff: false,
                startDate: undefined,
                recipient: undefined,
                cliffEndDate: undefined,
                cliffAmount: '',
                stepPayouts: 1,
                stepAmount: '',
                stepConfig: stepConfigurations[0],
                fundSource: undefined,
                insufficientBalance: false,
              })
            }
          >
            Add Item
          </Button>
        </div>
      </div>
    </div>
  )
}
