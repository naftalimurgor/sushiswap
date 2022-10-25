import { Breadcrumb, BreadcrumbLink } from '@sushiswap/ui'
import { Layout } from 'components'
import {CreateForm, NewVesting} from 'components/vesting'
import { NextSeo } from 'next-seo'

const LINKS: BreadcrumbLink[] = [
  {
    href: '/vesting/create',
    label: 'Create Vesting',
  },
  {
    href: '/vesting/create/single',
    label: 'Single',
  },
]

const SingleVesting = () => {
  return (
    <>
      <NextSeo title="New Vesting" />
      <Layout maxWidth='full' className="bg-input m-0 p-0 px-0 py-0 !mb-0">
        <main className="flex flex-col items-start gap-y-[40px] p-8 lg:flex-row lg:gap-x-[40px] lg:gap-y-0">
          <section className={`w-full lg:w-1/2`}>
            <CreateForm />
          </section>
          <NewVesting width='w-full lg:w-1/2' />
        </main>
      </Layout>
    </>
  )
}

export default SingleVesting
