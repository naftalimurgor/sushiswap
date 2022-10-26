import { Breadcrumb, BreadcrumbLink } from '@sushiswap/ui'
import { Layout } from 'components'
import { CreateMultipleForm } from 'components/vesting'
import { NextSeo } from 'next-seo'

const LINKS: BreadcrumbLink[] = [
  {
    href: '/vesting/create',
    label: 'Create Vesting',
  },
  {
    href: '/vesting/create/single',
    label: 'Multiple',
  },
]

const MultipleVesting = () => {
  return (
    <>
      <NextSeo title="New Vestings" />
      <Layout>
        <div className="mt-6">
          <CreateMultipleForm />
        </div>
      </Layout>
    </>
  )
}

export default MultipleVesting
