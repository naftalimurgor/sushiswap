import {useState} from "react";
import {Typography} from "@sushiswap/ui";
import {Transition} from "@headlessui/react";
import {ChevronUpIcon, MenuAlt2Icon, XIcon, CurrencyDollarIcon} from "@heroicons/react/solid";
import Link from "next/link";
import {useRouter} from "next/router";
import Image from 'next/image'
import {KynosLogo, DashboardIcon, StakeholdersIcon, CapTableIcon, ScenariosIcon, TransactionsIcon, DocumentsIcon, InvestorRelationsIcon, CompanySettingsIcon} from '../images'

const items = [
  {
    name: "Dashboard",
    disabled: true,
    icon: DashboardIcon
  },
  {
    name: "Stakeholders",
    disabled: true,
    icon: StakeholdersIcon
  },
  {
    name: "Cap Table",
    disabled: true,
    icon: CapTableIcon
  },
  {
    name: "Scenarios",
    disabled: true,
    icon: ScenariosIcon
  },
  {
    name: "Transactions",
    subTabs: [
      {
        name: "Vesting",
        url: "/vesting/create"
      },
      {
        name: "Payment",
        url: "/stream/create"
      }
    ],
    icon: TransactionsIcon,
    disabled: false,
  },
  {
    name: "Documents",
    disabled: true,
    icon: DocumentsIcon
  },
  {
    name: "Investor Relations",
    disabled: true,
    icon: InvestorRelationsIcon
  },
  {
    name: "Company Settings",
    disabled: true,
    icon: CompanySettingsIcon
  }
];

// TODO: Handle active state better
let activeItems = {tab: null, subTab: 1};
const activeIndex = (items, router) => {
  items.map((item, index) => {
    item.subTabs?.find(
      (subTab, i) => {
        subTab.url === router.pathname ? activeItems = {tab: index, subTab: i} : null;
      }
    );
  });
  return activeItems;
}

export const Nav = (props) => {
  const router = useRouter();
  const hideOnMobile = props.hideOnMobile ? props.hideOnMobile : false;
  const [expanded, setExpanded] = useState(activeIndex(items, router).tab);
  const [currentSubTab, setCurrentSubTab] = useState(activeItems.subTab);
  const [activeSubTab, setActiveSubTab] = useState({[expanded]: currentSubTab});

  return(
    <nav className={`text-center w-[300px] min-h-screen h-screen top-0 right-0 py-8 relative bg-secondary text-white overflow-y-auto ${hideOnMobile ? "hidden lg:block lg:flex-col" : ""}`}>
      <Link href={`/`} className={`flex items-center justify-center h-[60px] no-underline !overflow-visible w-full`}>
        <Image src={KynosLogo} alt="kynos logo" className="cursor-pointer" onClick={() => setExpanded(-1)}/>
      </Link>
      <ul className={`pt-[40px] pl-4 w-full`}>
        {items.map((item, index) => {
          return (<>
              <li
                key={index}
                className={`flex flex-wrap items-center justify-start gap-x-2 p-4 my-2 ${index === expanded ? 'bg-accent bg-opacity-10 border-r-4 border-accent rounded-l-md text-accent' : 'rounded-md text-white'} font-bold ${item.disabled ? 'opacity-30 cursor-default' : 'cursor-pointer'}`}
                onClick={() => {!item.disabled ? setExpanded(index) : ''; setActiveSubTab({[index]: -1})}}
              >
                {item?.icon
                  ?
                  <Image src={item.icon} alt={`${item.name} icon`} width="20" height="20"/>
                  :
                  ''}
                {
                  item.url
                    ?
                    <Link href={item.url}>
                      {item.name}
                    </Link>
                    :
                    item.name
                }
                {item.subTabs ? (expanded >= 0 ? <ChevronUpIcon className="w-5 h-5 ml-auto"/>
                  : <ChevronUpIcon className="w-5 h-5 rotate-180 ml-auto"/>) : ''}
              </li>
              {item.subTabs ? <>
                <ul
                  className={`${expanded === index ? "" : "hidden"} text-left mt-2 w-4/5 mx-auto text-white font-medium`}>
                  {item.subTabs.map((subTab, i) => {
                    return (<li key={i} onClick={() => setActiveSubTab({[index]: i})}>
                      <Typography
                        variant="sm"
                        className={`cursor-pointer p-2 rounded-md ${activeSubTab[index] === i ? "text-accent" : ""}`}>
                        <Link href={subTab.url ? subTab.url : ''}>
                          {subTab.name}
                        </Link>
                      </Typography>
                    </li>)
                  })}
                </ul>
              </> : ''}
              <li className="my-4 bg-white bg-opacity-10 h-[1px] w-11/12"></li>
            </>
          )
        })}
      </ul>
    </nav>
  )
}

export const MobileSideNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
        <span className="absolute top-4 left-8 p-2 text-primary bg-secondary cursor-pointer rounded-md lg:hidden" onClick={toggle}>
          {
            isOpen ? <XIcon width={25}/>
              : <MenuAlt2Icon width={30}/>
          }
        </span>
      {
        isOpen ? <div
            className="backdrop-blur w-full h-screen fixed top-0 right-0 bg-black bg-opacity-20 lg:hidden"
            onClick={toggle}
          ></div>
          : ''
      }
      <Transition
        show={isOpen}
        enter="transition ease-in duration-100 transform"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transition ease-out duration-75 transform"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
        className="z-20 w-[300px] absolute lg:hidden"
      >
        <Nav/>
      </Transition>
    </>
  )
}

export const SideNav = () => {
  return (<>
    <MobileSideNav/>
    <Nav hideOnMobile={true} />
  </>);
};