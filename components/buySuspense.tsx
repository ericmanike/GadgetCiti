import { Suspense } from 'react';
import BuyPage from './buyContent';
import Loader from '@/app/loading';

export default function BuySuspense() {
  return (
    <Suspense fallback={<Loader />}>
      <BuyPage />
    </Suspense>
  );
}