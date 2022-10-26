import { Breadcrumb, BreadcrumbLink } from '@sushiswap/ui'
import { Layout } from 'components'
import { CreateMultipleForm } from 'components/stream'
import { NextSeo } from 'next-seo'

const LINKS: BreadcrumbLink[] = [
  {
    href: '/stream/create',
    label: 'Create Stream',
  },
  {
    href: '/stream/create/multiple',
    label: 'Multiple',
  },
]

const MultipleStream = () => {
  return (
    <>
      <NextSeo title="New Streams" />
      <Layout>
          <CreateMultipleForm />
      </Layout>
    </>
  )
}

export default MultipleStream
