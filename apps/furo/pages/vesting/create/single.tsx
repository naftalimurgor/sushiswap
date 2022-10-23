import { Breadcrumb, BreadcrumbLink } from '@sushiswap/ui'
import { Layout } from 'components'
import { CreateForm } from 'components/vesting'
import { NextSeo } from 'next-seo'
import { SideNav } from "../../../components/SideNav";

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
        <div className="flex gap-x-5 w-full">
          <CreateForm />
        </div>
      </Layout>
    </>
  )
}

export default SingleVesting
