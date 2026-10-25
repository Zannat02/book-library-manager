
import { createBrowserRouter } from 'react-router';

import RootLayout from '../layouts/RootLayout';
import Home from '../pages/Home/Home';
import AddBook from '../pages/AddBook/AddBook';
import BookDetails from '../pages/BookDetails/BookDetails';
import EditBook from '../pages/EditBook/EditBook';

const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: 'books/add',
        Component: AddBook,
      },
      {
        path: 'books/:id',
        Component: BookDetails,
      },
     {
    path: '/books/edit/:id',
    element: <EditBook />,
},
    ],
  },
]);

export default router;
