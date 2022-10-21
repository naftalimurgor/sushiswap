import {useState} from "react";
import {Typography} from "@sushiswap/ui";
import {Transition} from "@headlessui/react";
import {ChevronUpIcon, MenuAlt2Icon, XIcon, CurrencyDollarIcon} from "@heroicons/react/solid";
import Link from "next/link";
import {useRouter} from "next/router";

// TODO: better url handling
const items = [{
  name: "Transactions", subTabs: ["Vesting", "Payment",], url: "/furo/vesting/create/single", icon: <CurrencyDollarIcon width={25} height={25} />
}];

const activeIndex = (items, router) => {
  const activeItem = items.find((item) => {
    return item.url === router.pathname;
  });
  return items.indexOf(activeItem);
}

// TODO: automatically get active sub-tab
export const Nav = (props) => {
  const router = useRouter();
  const hideOnMobile = props.hideOnMobile ? props.hideOnMobile : false;
  const [expanded, setExpanded] = useState(activeIndex(items, router));
  const [activeSubTab, setActiveSubTab] = useState({[expanded]: 0});

  return(
    <nav className={`w-[300px] h-screen fixed top-0 right-0 relative bg-secondary text-white overflow-y-auto ${hideOnMobile ? "hidden lg:flex" : ""}`}>
      <ul className={`pt-[80px] pb-8 pl-4 w-full`}>
        {items.map((item, index) => {
          return (<>
              <li
                key={index}
                className={`flex flex-wrap items-center justify-between p-4 my-2 cursor-pointer ${index === expanded ? 'bg-accent bg-opacity-10 border-r-4 border-accent rounded-l-md text-accent' : 'rounded-md text-white'} font-bold`}
                onClick={() => {setExpanded(index); setActiveSubTab({[index]: 0})}}
              >
                {item?.icon ? item.icon : ''}
                <Link href={item.url ? item.url : ''}>
                  {item.name}
                </Link>
                {item.subTabs ? (expanded ? <ChevronUpIcon className="w-5 h-5"/>
                  : <ChevronUpIcon className="w-5 h-5 rotate-180"/>) : ''}
              </li>
              {item.subTabs ? <>
                <ul
                  className={`${expanded === index ? "" : "hidden"} text-left mt-2 w-4/5 mx-auto text-white font-medium`}>
                  {item.subTabs.map((subTab, i) => {
                    return (<li key={i} onClick={() => setActiveSubTab({[index]: i})}>
                      <Typography
                        variant="sm"
                        className={`cursor-pointer p-2 rounded-md ${activeSubTab[index] === i ? "text-accent" : ""}`}>
                        <Link href={`/furo/vesting/create/single`}>
                          {subTab}
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
        <span className="z-30 absolute top-4 left-8 p-2 text-primary bg-secondary cursor-pointer rounded-md lg:hidden" onClick={toggle}>
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