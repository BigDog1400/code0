import { FC, useEffect, useState } from 'react';
import meta from '@/components/generated/import.meta';
import '../../App.css';
import { useParams } from 'react-router-dom';

function App() {
  const [componentImport, setComponentImport] = useState<{
    component: FC | null;
  }>({ component: null });
  useEffect(() => {
    const { version } = useParams();
    async function getComponent() {
      try {
        const component = (
          await import(
            `@/components/generated/${meta.generationId}_${version}.${meta.extension}`
          )
        ).default as FC;

        setComponentImport({ component });
      } catch (error) {
        console.log(error);
      }
    }
    getComponent();
  }, []);

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
      {componentImport.component &&
        renderComponentSafely(componentImport.component)}
    </>
  );
}

export default App;