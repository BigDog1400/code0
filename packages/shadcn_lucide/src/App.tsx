import './App.css';
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import ComponentView from "./components/views/CompoentView";

const router = createHashRouter([
  {
    path: "/component/:version",
    element: <ComponentView />,
  }
])

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App;
