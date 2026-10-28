import { createBrowserRouter, Link } from 'react-router';

import RootLayout from '../layouts/RootLayout';
import Home from '../pages/Home/Home';
import AddBook from '../pages/AddBook/AddBook';
import BookDetails from '../pages/BookDetails/BookDetails';
import EditBook from '../pages/EditBook/EditBook';

const NotFound = () => (
    <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-3xl font-bold text-[#241942]">Page not found</h1>
        <p className="mt-3 text-gray-500">
            The page you are looking for does not exist.
        </p>
        <Link
            to="/"
            className="mt-6 inline-block bg-[#241942] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2F8F70]"
        >
            Back to the library
        </Link>
    </main>
);

const router = createBrowserRouter([
    {
        path: '/',
        Component: RootLayout,
        children: [
            { index: true, Component: Home },
            { path: 'books/add', Component: AddBook },
            { path: 'books/:id', Component: BookDetails },
            { path: 'books/edit/:id', Component: EditBook },
            { path: '*', Component: NotFound },
        ],
    },
]);

export default router;