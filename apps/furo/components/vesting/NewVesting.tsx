import React from 'react'
import {
  Select,
  Typography,
  Form
} from '@sushiswap/ui'
import {Controller, useForm} from "react-hook-form";

const whoCanCancel = Object.freeze(["Only Senders", "Only Senders", "Only Senders", "Only Senders"]);

export const NewVesting = ({width }) => {
  const {control} = useForm();

  return (<section className={`flex flex-col gap-[15px] p-8 overflow-x-visible rounded-xl sm:rounded-2xl bg-primary ${width}`}>
    <Typography variant="xl" weight={600} className="text-typo-primary">New Vesting</Typography>
    <p className="text-base text-left text-muted">
      Ideal for vesting! Set up the æ•nount you want to vest, start-end date, release frequency youte good to go. Additionally, you can specify the cliff date and arnount when the initial tokens will be to the recöient or set Transfer and preferences.
    </p>
    <div
      className="w-full p-8 text-left bg-input rounded-xl">
      <Typography variant="lg" weight={600} className="text-typo-primary">Overview</Typography>
      <Controller
        control={control}
        name="recipient"
        render={({field: {onChange, value}, fieldState: {error}}) => (
          <>
            <Select
              button={
                <Select.Button error={!!error?.message} className="shadow-none bg-transparent text-typo-primary mb-2">
                  {value ? value : 'Only Senders'}
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
      <p className="text-sm text-muted">
        First 0% (0.00) released on 2022-08-23 at 13:14. And then 0% (0.00 ) released every second. until Tue 23rd Aug, 2022 - 13:21.
      </p>
    </div>
  </section>)
}
