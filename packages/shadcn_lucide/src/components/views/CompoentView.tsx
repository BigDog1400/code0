import { FC, useEffect, useState } from 'react';
import meta from '@/components/generated/import.meta';
import '../../App.css';
import { useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
function App() {
  const [componentImport, setComponentImport] = useState<{
    component: FC | null;
  }>({ component: null });
  const { version } = useParams();
  useEffect(() => {
    async function getComponent() {
      try {
        meta.find((item) => {
          console.log(item, version);
          if (item.version == version) {
            setComponentImport({ component: item.name });
          }
        });

        // setComponentImport({ component });
      } catch (error) {
        console.log(error);
      }
    }
    getComponent();
  }, [version]);

  function renderComponentSafely(Component: FC) {
    try {
      return <Component />;
    } catch (error) {
      // Handle the error gracefully, e.g., log it or show an error message
      console.error('Error rendering component:', error);
      return <div>Error rendering component</div>; // You can customize the error message here
    }
  }

  return (
    <>
      <p className="text-2xl font-semibold leading-none tracking-tight">
        prueba
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Basic</CardTitle>
          <CardDescription>For personal use</CardDescription>
        </CardHeader>
        <CardContent>
          <h1 className="text-4xl font-bold">Free</h1>
          <ul className="mt-4 space-y-2">
            <li>10GB Storage</li>
            <li>1 User</li>
            <li>Limited Features</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button>Upgrade</Button>
        </CardFooter>
      </Card>
      {componentImport.component &&
        renderComponentSafely(componentImport.component)}
    </>
  );
}

export default App;
