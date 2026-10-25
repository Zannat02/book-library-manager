
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
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
    X,
    Star,
    CheckCircle,
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/books';

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submittingRating, setSubmittingRating] = useState(false);
    const [ratingError, setRatingError] = useState('');
    const [ratingMessage, setRatingMessage] = useState('');

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

    const handleRatingSubmit = async (event) => {
        event.preventDefault();

        if (selectedRating < 1 || selectedRating > 5) {
            setRatingError('Please select a rating from 1 to 5 stars.');
            return;
        }

        try {
            setSubmittingRating(true);
            setRatingError('');
            setRatingMessage('');

            const response = await fetch(`${API_URL}/${id}/rating`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rating: selectedRating,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Failed to submit your rating.'
                );
            }

            const updatedBook =
                result.data?.book ||
                result.data?.updatedBook ||
                result.data;

            if (
                updatedBook &&
                (updatedBook._id || updatedBook.rating !== undefined)
            ) {
                setBook((previousBook) => ({
                    ...previousBook,
                    ...updatedBook,
                }));
            } else {
                const bookResponse = await fetch(`${API_URL}/${id}`);
                const bookResult = await bookResponse.json();

                if (!bookResponse.ok || !bookResult.success) {
                    throw new Error(
                        bookResult.message || 'Rating saved, but book details could not be refreshed.'
                    );
                }

                setBook(bookResult.data);
            }

            setShowRatingModal(false);
            setSelectedRating(0);
            setHoveredRating(0);
            setRatingMessage('Thank you! Your rating has been submitted.');
        } catch (err) {
            setRatingError(
                err.message || 'Something went wrong while submitting your rating.'
            );
        } finally {
            setSubmittingRating(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            setDeleteError('');

            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Failed to delete book.'
                );
            }

            navigate('/');
        } catch (err) {
            setDeleteError(
                err.message || 'Something went wrong while deleting the book.'
            );
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-3 text-[#2F8F70]">
                    <LoaderCircle className="animate-spin" size={24} />
                    <span className="font-medium">
                        Loading book details...
                    </span>
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

    const averageRating = Number(book.rating) || 0;
    const totalRatings = Number(book.totalRatings) || 0;

    const openRatingModal = () => {
        setSelectedRating(0);
        setHoveredRating(0);
        setRatingError('');
        setRatingMessage('');
        setShowRatingModal(true);
    };

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

                {deleteError && (
                    <div
                        role="alert"
                        className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <p>{deleteError}</p>

                        <button
                            type="button"
                            onClick={() => setDeleteError('')}
                            aria-label="Dismiss error"
                            className="shrink-0"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {ratingMessage && (
                    <div
                        role="status"
                        className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800"
                    >
                        <CheckCircle size={18} />
                        {ratingMessage}

                        <button
                            type="button"
                            onClick={() => setRatingMessage('')}
                            aria-label="Dismiss message"
                            className="ml-auto"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

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

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <div
                                    className="flex items-center gap-1"
                                    aria-label={`Average rating ${averageRating} out of 5`}
                                >
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={21}
                                            className={
                                                star <= Math.round(averageRating)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-gray-300'
                                            }
                                        />
                                    ))}
                                </div>

                                <span className="font-bold text-[#241942]">
                                    {averageRating.toFixed(1)} / 5
                                </span>

                                <span className="text-sm text-[#756B88]">
                                    ({totalRatings}{' '}
                                    {totalRatings === 1 ? 'rating' : 'ratings'})
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={openRatingModal}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2F8F70] px-5 py-3 font-semibold text-white transition hover:bg-[#26765D]"
                            >
                                <Star size={18} />
                                Rate Book
                            </button>

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
                                    onClick={() => {
                                        setDeleteError('');
                                        setShowDeleteConfirm(true);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                    <Trash2 size={17} />
                                    Delete Book
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
                    onClick={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !submittingRating
                        ) {
                            setShowRatingModal(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="rating-modal-title"
                        className="my-8 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2
                                    id="rating-modal-title"
                                    className="text-2xl font-bold text-[#241942]"
                                >
                                    Rate This Book
                                </h2>

                                <p className="mt-2 text-sm text-[#756B88]">
                                    How would you rate {book.title}?
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={submittingRating}
                                onClick={() => setShowRatingModal(false)}
                                aria-label="Close rating modal"
                                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleRatingSubmit} className="mt-7">
                            <p className="text-sm font-semibold text-[#352B4A]">
                                Select your rating
                            </p>

                            <div
                                className="mt-4 flex items-center justify-center gap-3"
                                onMouseLeave={() => setHoveredRating(0)}
                            >
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const activeRating =
                                        hoveredRating || selectedRating;

                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            disabled={submittingRating}
                                            onClick={() => {
                                                setSelectedRating(star);
                                                setRatingError('');
                                            }}
                                            onMouseEnter={() =>
                                                setHoveredRating(star)
                                            }
                                            aria-label={`Rate ${star} out of 5 stars`}
                                            aria-pressed={
                                                selectedRating === star
                                            }
                                            className="rounded-md transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#2F8F70] disabled:opacity-50"
                                        >
                                            <Star
                                                size={36}
                                                className={
                                                    star <= activeRating
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-gray-300'
                                                }
                                            />
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="mt-3 text-center text-sm text-[#756B88]">
                                {selectedRating
                                    ? `You selected ${selectedRating} out of 5 stars.`
                                    : 'Choose from 1 to 5 stars.'}
                            </p>

                            {ratingError && (
                                <p
                                    role="alert"
                                    className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
                                >
                                    {ratingError}
                                </p>
                            )}

                            <div className="mt-7 flex flex-wrap justify-end gap-3">
                                <button
                                    type="button"
                                    disabled={submittingRating}
                                    onClick={() => setShowRatingModal(false)}
                                    className="rounded-xl border border-[#E2DCEC] px-5 py-3 font-semibold text-[#5C5274] transition hover:bg-[#F8F7FC] disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submittingRating}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2F8F70] px-5 py-3 font-semibold text-white transition hover:bg-[#26765D] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submittingRating && (
                                        <LoaderCircle
                                            size={18}
                                            className="animate-spin"
                                        />
                                    )}

                                    {submittingRating
                                        ? 'Submitting...'
                                        : 'Submit Rating'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !deleting
                        ) {
                            setShowDeleteConfirm(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-dialog-title"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2
                                    id="delete-dialog-title"
                                    className="text-xl font-bold text-[#241942]"
                                >
                                    Delete this book?
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-gray-600">
                                    Are you sure you want to delete{' '}
                                    <span className="font-semibold">
                                        "{book.title}"
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setShowDeleteConfirm(false)}
                                aria-label="Close confirmation"
                                className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setShowDeleteConfirm(false)}
                                className="rounded-xl border border-gray-200 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleting ? (
                                    <LoaderCircle
                                        className="animate-spin"
                                        size={17}
                                    />
                                ) : (
                                    <Trash2 size={17} />
                                )}

                                {deleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default BookDetails;
