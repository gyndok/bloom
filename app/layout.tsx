import './globals.css';
import {SiteAnalytics} from '@/components/site-analytics';
export const metadata={icons:{icon:'/favicon.svg',apple:'/apple-touch-icon.png'},title:'Bloom | Pregnancy & due date calculator',description:'Calculate your due date from your last period, conception, IVF transfer, ultrasound, or known due date. Explore your pregnancy timeline privately.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<SiteAnalytics/></body></html>}
