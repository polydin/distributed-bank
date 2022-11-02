import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import {
  loader as txLoader,
} from './routes/TransactionList'
import TransactionList from './routes/TransactionList';
import Root, {
  loader as rootLoader,
} from './routes/Root';
import Login, { 
  action as loginAction 
} from './routes/Login';
import Exchange, {
  loader as exchangeLoader,
  action as exchangeAction,
} from './routes/Exchange';
import Transfer, {
  action as transferAction,
} from './routes/Transfer';
import Proposal, {
  loader as proposalLoader,
  action as proposalAction,
} from './routes/Proposal';
import UserInfo, {
  loader as userLoader,
} from './routes/UserInfo';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: rootLoader,
    children: [
      {
        index: true,
        element: <UserInfo />,
        loader: userLoader,
      },
      { 
        path: '/transactions', 
        element: <TransactionList />,
        loader: txLoader,
      },
      {
        path: '/exchange',
        element: <Exchange />,
        action: exchangeAction,
        loader: exchangeLoader,
      },
      {
        path: '/transfer',
        element: <Transfer />,
        action: transferAction,
      },
      {
        path: '/proposal',
        element: <Proposal />,
        action: proposalAction,
        loader: proposalLoader,
      }
    ],
  },
  {
    path: "/login",
    element: <Login />,
    action: loginAction,
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)