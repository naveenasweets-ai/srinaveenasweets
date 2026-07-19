import { MdCelebration, MdOutlineFestival } from 'react-icons/md';
import { FiShoppingCart } from 'react-icons/fi';
import { GrFavorite } from 'react-icons/gr';
import { VscOpenInProduct } from "react-icons/vsc";
import { FaBirthdayCake, FaHotdog, FaCookieBite } from 'react-icons/fa';
import { MdOutlineDashboardCustomize } from 'react-icons/md';
import { LuDessert } from 'react-icons/lu';
import { MdDeliveryDining } from 'react-icons/md';
import { RiSecurePaymentFill, RiCake3Fill } from 'react-icons/ri';
import { VscPackage } from 'react-icons/vsc';

export const allNavItems = [
  { title: 'Sweets', linkTo: 'sweets', itemIcon: <LuDessert /> },
  { title: 'Cakes', linkTo: 'cakes', itemIcon: <FaBirthdayCake /> },
  { title: 'Hot Items', linkTo: 'hot_items', itemIcon: <FaHotdog /> },
  { title: 'Biscuits', linkTo: 'biscuits', itemIcon: <FaCookieBite /> },
  {
    title: 'Occasions',
    linkTo: 'occasion',
    itemIcon: <MdOutlineFestival />,
  },
  {
    title: 'Decorations',
    linkTo: 'decoration',
    itemIcon: <MdCelebration />,
  },
];

export const customerMenuItems = [
  {
    name: 'Favorites',
    to: 'favorites',
    icon: <GrFavorite className="text-lg" />,
  },
  { name: 'Cart', to: 'cart', icon: <FiShoppingCart className="text-lg" /> },
  { name: 'My Orders', to: 'my-orders', icon: <VscPackage /> },
];

export const adminMenuItems = [
  {
    name: 'Products',
    to: 'admin-products',
    icon: <VscOpenInProduct className="text-lg" />,
  },
  {
    name: 'Orders',
    to: 'admin-orders',
    icon: <VscPackage className="text-lg" />,
  },
  {
    name: 'Customize App',
    to: 'app-customize',
    icon: <MdOutlineDashboardCustomize className="text-lg" />,
  },
];

export const ICON_SET = [
  {
    name: 'Fast Delivery',
    svg: <MdDeliveryDining />,
  },
  {
    name: 'Secure Payments',
    svg: <RiSecurePaymentFill />,
  },
  {
    name: 'Delicious Sweets',
    svg: <RiCake3Fill />,
  },
  {
    name: 'Occasional Items',
    svg: <MdOutlineFestival />,
  },
];
