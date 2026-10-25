
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
    Search,
    ArrowUpRight,
    SlidersHorizontal,
    BookOpen,
    LoaderCircle,
    RefreshCw,
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/books';

const BookCollection = () => {
    const [searchInput, setSearchInput] = useState('');
    const [genreInput, setGenreInput] = useState('');
    const [search, setSearch] = useState('');
    const [genre, setGenre] = useState('');

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        const fetchBooks = async () => {
            try {
                setLoading(true);
                setError('');

                const params = new URLSearchParams({
                    page: '1',
                    limit: '12',
                });

                if (search.trim()) {
                    params.set('search', search.trim());
                }

                if (genre) {
                    params.set('genre', genre);
                }

                const response = await fetch(
                    `${API_URL}?${params.toString()}`,
                    { signal: controller.signal }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || 'Failed to load books.'
                    );
                }

                setBooks(result.data || []);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(
                        err.message ||
                            'Could not connect to the server.'
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchBooks();

        return () => controller.abort();
    }, [search, genre]);

    const handleBrowse = (event) => {
        event.preventDefault();
        setSearch(searchInput);
        setGenre(genreInput);
    };

    return (
        <section
            id="books"
            className="border-t border-[#241942]/10 bg-white/70"
        >
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-semibold tracking-wide text-[#2F8F70]">
                            THE READING ROOM
                        </p>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#241942] sm:text-4xl">
                            Find your next
                            <br className="sm:hidden" /> great read.
                        </h2>

                        <p className="mt-3 max-w-lg leading-7 text-gray-600">
                            Search your collection or explore a book
                            you haven't opened yet.
                        </p>
                    </div>

                    <Link
                        to="/books/add"
                        className="inline-flex w-fit items-center gap-2 border border-[#241942] bg-[#241942] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:border-[#2F8F70] hover:bg-[#2F8F70]"
                    >
                        Add to collection
                        <ArrowUpRight size={17} />
                    </Link>
                </div>

                <form
                    onSubmit={handleBrowse}
                    className="mt-10 grid gap-3 md:grid-cols-[1fr_220px_auto]"
                >
                    <label className="flex items-center gap-3 border border-gray-200 bg-white px-4 transition focus-within:border-[#2F8F70]">
                        <Search
                            size={19}
                            className="shrink-0 text-gray-400"
                        />

                        <input
                            type="search"
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
                            placeholder="Search title or author..."
                            aria-label="Search books by title or author"
                            className="min-w-0 flex-1 bg-transparent py-4 text-sm text-[#241942] outline-none placeholder:text-gray-400"
                        />
                    </label>

                    <select
                        value={genreInput}
                        onChange={(event) =>
                            setGenreInput(event.target.value)
                        }
                        aria-label="Filter by genre"
                        className="border border-gray-200 bg-white px-4 py-4 text-sm text-gray-600 outline-none focus:border-[#2F8F70]"
                    >
                        <option value="">All genres</option>
                        <option value="Fiction">Fiction</option>
                        <option value="Fantasy">Fantasy</option>
                        <option value="Science">Science</option>
                        <option value="Mystery">Mystery</option>
                        <option value="Romance">Romance</option>
                        <option value="Biography">Biography</option>
                    </select>

                    <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 border border-[#241942] bg-[#241942] px-5 py-4 text-sm font-semibold text-white transition hover:border-[#2F8F70] hover:bg-[#2F8F70]"
                    >
                        <SlidersHorizontal size={17} />
                        Browse
                    </button>
                </form>

                <div className="mt-12">
                    {loading ? (
                        <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-[#241942]">
                            <LoaderCircle
                                size={32}
                                className="animate-spin text-[#2F8F70]"
                            />
                            <p className="text-sm text-gray-500">
                                Loading your collection...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                            <p className="text-lg font-semibold text-[#241942]">
                                Unable to load books
                            </p>

                            <p className="mt-2 text-sm text-gray-500">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearch((current) => current + ' ');
                                    setSearch((current) => current.trim());
                                }}
                                className="mt-5 inline-flex items-center gap-2 border border-[#241942] bg-[#241942] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2F8F70]"
                            >
                                <RefreshCw size={16} />
                                Try again
                            </button>
                        </div>
                    ) : books.length === 0 ? (
                        <div className="grid min-h-64 place-items-center border-y border-[#241942]/10 py-12 text-center">
                            <div>
                                <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#E9E3FA] text-[#241942]">
                                    <Search
                                        size={25}
                                        strokeWidth={1.5}
                                    />
                                </div>

                                <h3 className="mt-5 text-xl font-semibold text-[#241942]">
                                    No books found.
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Try another title, author, or genre.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchInput('');
                                        setGenreInput('');
                                        setSearch('');
                                        setGenre('');
                                    }}
                                    className="mt-5 border border-[#241942] bg-white px-5 py-3 text-sm font-semibold text-[#241942] transition hover:bg-[#241942] hover:text-white"
                                >
                                    Clear filters
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing{' '}
                                    <span className="font-semibold text-[#241942]">
                                        {books.length}
                                    </span>{' '}
                                    {books.length === 1 ? 'book' : 'books'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {books.map((book) => (
                                    <article
                                        key={book._id}
                                        className="group min-w-0"
                                    >
                                        <Link
                                            to={`/books/${book._id}`}
                                            className="block"
                                        >
                                            <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-[#F7F4EE]">
                                                {book.coverImage ? (
                                                    <img
                                                        src={book.coverImage}
                                                        alt={`Cover of ${book.title}`}
                                                        loading="lazy"
                                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
                                                        <BookOpen
                                                            size={42}
                                                            strokeWidth={1.2}
                                                            className="text-[#2F8F70]"
                                                        />
                                                        <p className="text-lg font-semibold text-[#241942]">
                                                            {book.title}
                                                        </p>
                                                    </div>
                                                )}

                                                <span className="absolute bottom-3 left-3 bg-white/95 px-3 py-1.5 text-xs font-medium text-[#241942]">
                                                    {book.genre || 'Uncategorized'}
                                                </span>
                                            </div>

                                            <div className="pt-4">
                                                <h3 className="line-clamp-2 text-lg font-semibold text-[#241942] transition group-hover:text-[#2F8F70]">
                                                    {book.title}
                                                </h3>

                                                <p className="mt-2 text-sm text-gray-500">
                                                    by {book.author}
                                                </p>

                                                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2F8F70]">
                                                    View details
                                                    <ArrowUpRight
                                                        size={16}
                                                    />
                                                </span>
                                            </div>
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BookCollection;
