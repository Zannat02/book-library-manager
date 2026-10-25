
import React from 'react';
import { Link } from 'react-router';

const Navbar = () => {
    return (
        <header className="sticky top-0 z-50 border-b border-[#E9E3FA] bg-[#F7F4EE]/95 backdrop-blur-md">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#241942] text-xl text-white">
                        📚
                    </div>

                    <div>
                        <h1 className="text-lg font-bold text-[#241942] sm:text-xl">
                            BookNest
                        </h1>
                        <p className="text-xs text-gray-500">
                            Your personal library
                        </p>
                    </div>
                </Link>

                <div className="flex items-center gap-3 sm:gap-6">
                    <Link
                        to="/"
                        className="text-sm font-medium text-[#241942] transition hover:text-[#2F8F70]"
                    >
                        Home
                    </Link>

                    <Link
                        to="/books/add"
                        className="rounded-xl bg-[#241942] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#392760] sm:px-5"
                    >
                        <span className="mr-1">+</span>
                        Add Book
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
