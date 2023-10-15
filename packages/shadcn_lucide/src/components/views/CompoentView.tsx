import { FC, useEffect, useState } from 'react';
import meta from '@/components/generated/import.meta';
import '../../App.css';
import { useParams } from 'react-router-dom';

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
      window.postMessage('component-loaded', '*');
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
