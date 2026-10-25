
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    UserRound,
    Building2,
    Languages,
    FileText,
    Tag,
    Hash,
    LoaderCircle,
    AlertCircle,
    Pencil,
    Trash2,
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/books';

const BookDetails = () => {
    const { id } = useParams();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        const fetchBook = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await fetch(`${API_URL}/${id}`, {
                    signal: controller.signal,
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || 'Failed to load book details.'
                    );
                }

                setBook(result.data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'Something went wrong.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchBook();

        return () => controller.abort();
    }, [id]);

    if (loading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-3 text-[#2F8F70]">
                    <LoaderCircle className="animate-spin" size={24} />
                    <span className="font-medium">Loading book details...</span>
                </div>
            </main>
        );
    }

    if (error || !book) {
        return (
            <main className="mx-auto max-w-3xl px-5 py-20 text-center">
                <AlertCircle
                    className="mx-auto mb-4 text-red-500"
                    size={42}
                />
                <h1 className="text-2xl font-bold text-[#241942]">
                    Unable to Load Book
                </h1>
                <p className="mt-3 text-gray-500">
                    {error || 'The requested book could not be found.'}
                </p>
                <Link
                    to="/"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#241942] px-5 py-3 font-medium text-white transition hover:bg-[#35265A]"
                >
                    <ArrowLeft size={18} />
                    Back to Library
                </Link>
            </main>
        );
    }

    const details = [
        { label: 'Author', value: book.author, icon: UserRound },
        { label: 'Genre', value: book.genre, icon: BookOpen },
        { label: 'ISBN', value: book.isbn, icon: Hash },
        { label: 'Publisher', value: book.publisher, icon: Building2 },
        { label: 'Published Year', value: book.publishedYear, icon: Calendar },
        { label: 'Language', value: book.language, icon: Languages },
        { label: 'Pages', value: book.pages, icon: FileText },
        { label: 'Format', value: book.format, icon: BookOpen },
        { label: 'Edition', value: book.edition, icon: BookOpen },
    ];

    return (
        <main className="min-h-screen bg-[#F8F7FC] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <Link
                    to="/"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#5C5274] transition hover:text-[#2F8F70]"
                >
                    <ArrowLeft size={18} />
                    Back to Library
                </Link>

                <section className="overflow-hidden rounded-3xl border border-[#EAE6F2] bg-white shadow-sm">
                    <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[300px_1fr] lg:gap-12 lg:p-10">
                        <div className="flex flex-col items-center">
                            <div className="flex aspect-[3/4] w-full max-w-[300px] items-center justify-center overflow-hidden rounded-2xl bg-[#F0EDF7]">
                                {book.coverImage ? (
                                    <img
                                        src={book.coverImage}
                                        alt={`${book.title} book cover`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <BookOpen
                                        size={64}
                                        className="text-[#B6A9CE]"
                                    />
                                )}
                            </div>

                            {book.price !== undefined &&
                                book.price !== null && (
                                    <p className="mt-5 text-2xl font-bold text-[#2F8F70]">
                                        ${Number(book.price).toFixed(2)}
                                    </p>
                                )}
                        </div>

                        <div className="min-w-0">
                            <span className="inline-flex rounded-full bg-[#E7F5EF] px-3 py-1 text-sm font-semibold text-[#2F8F70]">
                                {book.genre || 'Uncategorized'}
                            </span>

                            <h1 className="mt-4 break-words text-3xl font-bold leading-tight text-[#241942] sm:text-4xl">
                                {book.title}
                            </h1>

                            <p className="mt-3 text-lg text-[#756B88]">
                                by {book.author}
                            </p>

                            <div className="my-7 h-px bg-[#EEEAF4]" />

                            <h2 className="mb-3 text-lg font-bold text-[#241942]">
                                About This Book
                            </h2>

                            <p className="whitespace-pre-line leading-7 text-[#756B88]">
                                {book.description ||
                                    'No description available for this book.'}
                            </p>

                            <h2 className="mb-4 mt-8 text-lg font-bold text-[#241942]">
                                Book Information
                            </h2>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {details.map(({ label, value, icon: Icon }) => (
                                    <div
                                        key={label}
                                        className="flex min-w-0 items-start gap-3 rounded-xl bg-[#F8F7FC] p-4"
                                    >
                                        <Icon
                                            size={19}
                                            className="mt-0.5 shrink-0 text-[#2F8F70]"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-[#8B829B]">
                                                {label}
                                            </p>
                                            <p className="mt-1 break-words font-semibold text-[#352B4A]">
                                                {value || 'Not provided'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {Array.isArray(book.tags) &&
                                book.tags.length > 0 && (
                                    <div className="mt-7">
                                        <h2 className="mb-3 flex items-center gap-2 font-bold text-[#241942]">
                                            <Tag
                                                size={18}
                                                className="text-[#2F8F70]"
                                            />
                                            Tags
                                        </h2>

                                        <div className="flex flex-wrap gap-2">
                                            {book.tags.map((tag, index) => (
                                                <span
                                                    key={`${tag}-${index}`}
                                                    className="rounded-full border border-[#EAE6F2] px-3 py-1.5 text-sm text-[#756B88]"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    to={`/books/edit/${book._id}`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#241942] px-5 py-3 font-semibold text-white transition hover:bg-[#35265A]"
                                >
                                    <Pencil size={17} />
                                    Edit Book
                                </Link>

                                <button
                                    type="button"
                                    disabled
                                    title="Delete functionality will be added next"
                                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-400 opacity-60"
                                >
                                    <Trash2 size={17} />
                                    Delete Book
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default BookDetails;