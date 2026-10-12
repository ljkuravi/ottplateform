import { redirect } from 'next/navigation';

export default function SellerProfileRoute() {
  redirect('/seller?tab=seller-profile');
}
