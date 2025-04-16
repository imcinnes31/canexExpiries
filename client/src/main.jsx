import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import MainMenu from "./components/MainMenu";
import AlertList from "./components/AlertList";
import CheckSection from "./components/CheckSection";
import ExpiryReport from "./components/ExpiryReport";
import ProjectionReport from "./components/ProjectionReport";
import "./index.css";

const router = createBrowserRouter([
  // {
  //   path: "/",
  //   element: <App />,
  //   children: [
  //     {
  //       path: "/",
  //       element: <RecordList />,
  //     },
  //   ],
  // },
  // {
  //   path: "/edit/:id",
  //   element: <App />,
  //   children: [
  //     {
  //       path: "/edit/:id",
  //       element: <ModifyRecord />,
  //     },
  //   ],
  // },
  // {
  //   path: "/create",
  //   element: <App />,
  //   children: [
  //     {
  //       path: "/create",
  //       element: <ModifyRecord />,
  //     },
  //   ],
  // },
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <MainMenu />,
      },
    ],
  },
  {
    path: "/alert/:type",
    element: <App />,
    children: [
      {
        path: "/alert/:type",
        element: <AlertList />,
      },
    ],
  },
  {
    path: "/check/:id",
    element: <App />,
    children: [
      {
        path: "/check/:id",
        element: <CheckSection />,
      },
    ],
  },
  {
    path: "/report/:reportDate",
    element: <App />,
    children: [
      {
        path: "/report/:reportDate",
        element: <ExpiryReport />,
      },
    ],
  },
  {
    path: "/projections/:type",
    element: <App />,
    children: [
      {
        path: "/projections/:type",
        element: <ProjectionReport />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);