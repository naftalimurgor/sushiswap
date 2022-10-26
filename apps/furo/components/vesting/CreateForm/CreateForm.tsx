import { yupResolver } from '@hookform/resolvers/yup'
import {Button, Form, Tab, Typography} from '@sushiswap/ui'
import { FC, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useAccount, useNetwork } from 'wagmi'

import { CreateVestingFormData, CreateVestingFormDataTransformedAndValidated } from '../types'
import { CliffDetailsSection } from './CliffDetailsSection'
import CreateFormReviewModal from './CreateFormReviewModal'
import { GeneralDetailsSection } from './GeneralDetailsSection'
import { GradedVestingDetailsSection } from './GradedVestingDetailsSection'
import { createVestingSchema, stepConfigurations } from './schema'
import { transformVestingFormData } from './transformVestingFormData'

export const CreateForm: FC = () => {
  const { chain: activeChain } = useNetwork()
  const { address } = useAccount()
  const [review, setReview] = useState(false)

  const methods = useForm<CreateVestingFormData>({
    // @ts-ignore
    resolver: yupResolver(createVestingSchema),
    defaultValues: {
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
    },
    mode: 'onChange',
  })

  const {
    formState: { isValid, isValidating },
    watch,
    reset,
  } = methods

  const formData = watch() as CreateVestingFormData
  const validatedData = isValid && !isValidating ? transformVestingFormData(formData) : undefined

  // Reset form if we switch network or change account
  useEffect(() => {
    setReview(false)
    reset()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain?.id, address])

  // createVestingSchema
  //   .validate(formData, { abortEarly: false })
  //   .then(function () {
  //     // Success
  //   })
  //   .catch(function (err) {
  //     err?.inner?.forEach((e) => {
  //       console.log(e.message, e.path)
  //     })
  //   })

  const SubmitButton = () => {
    return(
      <Form.Buttons>
        <Button type="submit" color="blue" disabled={!isValid || isValidating} className={`bg-accent w-full`}>
          Review Details
        </Button>
      </Form.Buttons>
    )}

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={methods.handleSubmit(() => setReview(true))} className="border-none w-full">
          <Tab.Group
            as="section"
            className={`z-10 overflow-hidden overflow-x-auto rounded-xl sm:rounded-2xl bg-primary`}
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
                Cliff Details
              </Tab>
              <Tab
                as={Typography}
                weight={600}
                className="bg-transparent focus:text-accent hover:text-accent"
              >
                Vesting Details
              </Tab>
            </Tab.List>
            <Tab.Panels className="bg-primary px-3 pb-8 text-typo-primary font-bold lg:px-8">
              <Tab.Panel>
                <GeneralDetailsSection />
                <SubmitButton />
              </Tab.Panel>
              <Tab.Panel>
                <CliffDetailsSection />
                <SubmitButton />
              </Tab.Panel>
              <Tab.Panel>
                <GradedVestingDetailsSection />
                <SubmitButton />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

        </Form>
      </FormProvider>
      {validatedData && review && (
        <CreateFormReviewModal
          open={review}
          onDismiss={() => setReview(false)}
          formData={validatedData as CreateVestingFormDataTransformedAndValidated}
        />
      )}
    </>
  )
}
