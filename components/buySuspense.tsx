import { Suspense } from 'react';
import BuyPage from './buyContent';
import SkeletonCards from './SkeletonCards';


export default function BuySuspense() {
  return (
    <Suspense fallback={<SkeletonCards cols={4} rows={2}/>}>
      <BuyPage />
    </Suspense>
  );
}