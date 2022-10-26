import { Breadcrumb, BreadcrumbLink, Typography } from '@sushiswap/ui'
import { Layout } from 'components'
import Link from 'next/link'
import { NextSeo } from 'next-seo'

const LINKS: BreadcrumbLink[] = [
  {
    href: '/vesting/create',
    label: 'Create Vesting',
  },
]

const VestingCreate = () => {
  return (
    <>
      <NextSeo title="New Vesting" />
      <Layout className={`flex items-center justify-center`}>
          <div className="flex flex-col justify-center gap-10">
            <Typography variant="h3" weight={500} className="text-center text-typo-primary">
              How many vestings would you like to create?
            </Typography>
            <div className="flex flex-col lg:flex-row justify-center items-center gap-10">
              <Link href="/vesting/create/single" passHref={true}>
                <a>
                  <button className="pt-[74px] relative cursor-pointer transition-all hover:scale-[1.02] group flex flex-col gap-10 items-center w-[240px] h-[280px] bg-white rounded-md hover:shadow-xl hover:shadow-slate-300">
                    <div className="w-[56px] h-[56px] bg-accent rounded-md" />
                    <Typography
                      weight={500}
                      className="absolute bottom-[60px] left-0 right-0 text-center text-typo-primary font-bold"
                    >
                      One
                    </Typography>
                  </button>
                </a>
              </Link>
              <Link href="/vesting/create/multiple" passHref={true}>
                <a>
                  <button className="pt-[60px] relative cursor-pointer transition-all hover:scale-[1.02] group flex flex-col gap-10 items-center  w-[240px] h-[280px] bg-white rounded-md hover:shadow-xl hover:shadow-slate-300">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="w-[40px] h-[40px] bg-accent rounded-md" />
                      <div className="w-[40px] h-[40px] bg-accent rounded-md" />
                      <div className="w-[40px] h-[40px] bg-accent rounded-md" />
                      <div className="w-[40px] h-[40px] bg-accent rounded-md" />
                    </div>
                    <Typography
                      weight={500}
                      className="absolute bottom-[60px] left-0 right-0 text-center text-typo-primary font-bold"
                    >
                      Multiple
                    </Typography>
                  </button>
                </a>
              </Link>
            </div>
          </div>
      </Layout>
    </>
  )
}

export default VestingCreate
