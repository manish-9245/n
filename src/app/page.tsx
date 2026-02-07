
import PageClient from './PageClient';

export default async function Home() {
  // We can just return the client component. 
  // The Data is now fetched in RootLayout and provided via Context.
  // This makes the navigation instant as this page doesn't need to block on data fetching.
  return (
    <PageClient />
  );
}
