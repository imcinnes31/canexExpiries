import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import ModifyRecord from "./components/ModifyRecord";
import RecordList from "./components/RecordList";
import MainMenu from "./components/MainMenu";
import AlertList from "./components/AlertList";
import CheckSection from "./components/CheckSection";
import ExpiryReport from "./components/ExpiryReport";
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
    path: "/expiryChecker/",
    element: <App />,
    children: [
      {
        path: "/expiryChecker/",
        element: <MainMenu />,
      },
    ],
  },
  {
    path: "/expiryChecker/alert/:type",
    element: <App />,
    children: [
      {
        path: "/expiryChecker/alert/:type",
        element: <AlertList />,
      },
    ],
  },
  {
    path: "/expiryChecker/check/:id",
    element: <App />,
    children: [
      {
        path: "/expiryChecker/check/:id",
        element: <CheckSection />,
      },
    ],
  },
  {
    path: "/expiryChecker/report/:reportDate",
    element: <App />,
    children: [
      {
        path: "/expiryChecker/report/:reportDate",
        element: <ExpiryReport />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);