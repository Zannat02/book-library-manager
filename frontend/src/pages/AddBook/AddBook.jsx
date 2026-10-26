import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
    ArrowLeft,
    BookOpen,
    Upload,
    CheckCircle2,
    AlertCircle,
    LoaderCircle,
} from 'lucide-react';

import { API_URL } from '../../config';

const BOOKS_API = `${API_URL}/api/books`;

const initialForm = {
    title: '',
    author: '',
    description: '',
    isbn: '',
    genre: 'Fiction',
    publisher: '',
    publishedYear: '',
    language: 'English',
    pages: '',
    coverImage: '',
    price: '',
    format: 'Paperback',
    edition: '',
    tags: '',
};

const AddBook = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        setError('');
        setSuccess('');

        if (!form.title.trim() || !form.author.trim()) {
            setError('Book title and author are required.');
            return;
        }

        const publishedYear = form.publishedYear.trim()
            ? Number(form.publishedYear)
            : null;

        const pages = form.pages.trim()
            ? Number(form.pages)
            : null;

        const price = form.price.trim()
            ? Number(form.price)
            : null;

        if (
            (publishedYear !== null &&
                (!Number.isInteger(publishedYear) ||
                    publishedYear < 0)) ||
            (pages !== null &&
                (!Number.isInteger(pages) || pages <= 0)) ||
            (price !== null &&
                (!Number.isFinite(price) || price < 0))
        ) {
            setError(
                'Please enter a valid publication year, page count, and price.'
            );
            return;
        }

        const bookData = {
            ...form,
            title: form.title.trim(),
            author: form.author.trim(),
            description: form.description.trim(),
            isbn: form.isbn.trim(),
            publisher: form.publisher.trim(),
            publishedYear,
            pages,
            price,
            coverImage: form.coverImage.trim(),
            edition: form.edition.trim(),
            tags: form.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
        };

        try {
            setLoading(true);

            const response = await fetch(BOOKS_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookData),
            });

            const contentType =
                response.headers.get('content-type') || '';

            if (!contentType.includes('application/json')) {
                throw new Error(
                    'The server returned an unexpected response. Please check that the backend is running correctly.'
                );
            }

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Failed to add the book.'
                );
            }

            setSuccess('Your book has been added successfully!');
            setForm({ ...initialForm });

            setTimeout(() => {
                navigate('/');
            }, 1200);
        } catch (err) {
            setError(
                err.message ||
                    'Could not connect to the server. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'mt-2 w-full border border-gray-200 bg-white px-4 py-3 text-sm text-[#241942] outline-none transition placeholder:text-gray-400 focus:border-[#2F8F70] disabled:cursor-not-allowed disabled:bg-gray-50';

    const labelClass =
        'block text-sm font-semibold text-[#241942]';

    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#2F8F70]"
                >
                    <ArrowLeft size={17} />
                    Back to collection
                </Link>

                <div className="mt-8 grid gap-10 lg:grid-cols-[0.8fr_1.7fr] lg:gap-14">
                    <section>
                        <div className="flex h-12 w-12 items-center justify-center bg-[#E9E3FA] text-[#241942]">
                            <BookOpen size={24} />
                        </div>

                        <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#241942] sm:text-4xl">
                            Add a new book
                        </h1>

                        <p className="mt-4 text-sm leading-7 text-gray-600">
                            Make room for another story. Add your
                            book details to build your personal
                            reading collection.
                        </p>

                        <div className="mt-8 border-l-2 border-[#2F8F70] pl-4">
                            <p className="text-sm leading-6 text-gray-500">
                                Fields marked with * are required.
                                You can add the remaining details
                                whenever you like.
                            </p>
                        </div>

                        {form.coverImage.trim() && (
                            <div className="mt-8">
                                <p className="mb-3 text-sm font-semibold text-[#241942]">
                                    Cover preview
                                </p>

                                <img
                                    src={form.coverImage}
                                    alt="Book cover preview"
                                    className="aspect-[3/4] w-40 border border-gray-200 bg-white object-cover"
                                    onError={(event) => {
                                        event.currentTarget.style.visibility =
                                            'hidden';
                                    }}
                                    onLoad={(event) => {
                                        event.currentTarget.style.visibility =
                                            'visible';
                                    }}
                                />
                            </div>
                        )}
                    </section>

                    <section className="bg-white p-5 shadow-sm sm:p-8">
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                            noValidate
                        >
                            {error && (
                                <div
                                    role="alert"
                                    aria-live="assertive"
                                    className="flex gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                                >
                                    <AlertCircle
                                        size={19}
                                        className="shrink-0"
                                    />
                                    <p>{error}</p>
                                </div>
                            )}

                            {success && (
                                <div
                                    role="status"
                                    aria-live="polite"
                                    className="flex gap-3 border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                                >
                                    <CheckCircle2
                                        size={19}
                                        className="shrink-0"
                                    />
                                    <p>{success}</p>
                                </div>
                            )}

                            <fieldset
                                disabled={loading}
                                className="min-w-0 space-y-6 disabled:opacity-80"
                            >
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="title"
                                            className={labelClass}
                                        >
                                            Book title *
                                        </label>
                                        <input
                                            id="title"
                                            name="title"
                                            value={form.title}
                                            onChange={handleChange}
                                            placeholder="e.g. The Alchemist"
                                            required
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="author"
                                            className={labelClass}
                                        >
                                            Author *
                                        </label>
                                        <input
                                            id="author"
                                            name="author"
                                            value={form.author}
                                            onChange={handleChange}
                                            placeholder="Author name"
                                            required
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="genre"
                                            className={labelClass}
                                        >
                                            Genre
                                        </label>
                                        <select
                                            id="genre"
                                            name="genre"
                                            value={form.genre}
                                            onChange={handleChange}
                                            className={inputClass}
                                        >
                                            <option value="Fiction">Fiction</option>
                                            <option value="Fantasy">Fantasy</option>
                                            <option value="Science">Science</option>
                                            <option value="Mystery">Mystery</option>
                                            <option value="Romance">Romance</option>
                                            <option value="Biography">Biography</option>
                                            <option value="Adventure">Adventure</option>
                                            <option value="History">History</option>
                                            <option value="Self-help">Self-help</option>
                                            <option value="Uncategorized">Uncategorized</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="description"
                                            className={labelClass}
                                        >
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="What is this book about?"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="coverImage"
                                            className={labelClass}
                                        >
                                            Cover image URL
                                        </label>
                                        <div className="relative">
                                            <Upload
                                                size={18}
                                                className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                                            />
                                            <input
                                                id="coverImage"
                                                name="coverImage"
                                                type="url"
                                                value={form.coverImage}
                                                onChange={handleChange}
                                                placeholder="https://example.com/book-cover.jpg"
                                                className={`${inputClass} pl-11`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="isbn"
                                            className={labelClass}
                                        >
                                            ISBN
                                        </label>
                                        <input
                                            id="isbn"
                                            name="isbn"
                                            value={form.isbn}
                                            onChange={handleChange}
                                            placeholder="ISBN number"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="publisher"
                                            className={labelClass}
                                        >
                                            Publisher
                                        </label>
                                        <input
                                            id="publisher"
                                            name="publisher"
                                            value={form.publisher}
                                            onChange={handleChange}
                                            placeholder="Publisher name"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="publishedYear"
                                            className={labelClass}
                                        >
                                            Publication year
                                        </label>
                                        <input
                                            id="publishedYear"
                                            name="publishedYear"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={form.publishedYear}
                                            onChange={handleChange}
                                            placeholder="e.g. 2024"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="pages"
                                            className={labelClass}
                                        >
                                            Number of pages
                                        </label>
                                        <input
                                            id="pages"
                                            name="pages"
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={form.pages}
                                            onChange={handleChange}
                                            placeholder="e.g. 250"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="language"
                                            className={labelClass}
                                        >
                                            Language
                                        </label>
                                        <input
                                            id="language"
                                            name="language"
                                            value={form.language}
                                            onChange={handleChange}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="format"
                                            className={labelClass}
                                        >
                                            Format
                                        </label>
                                        <select
                                            id="format"
                                            name="format"
                                            value={form.format}
                                            onChange={handleChange}
                                            className={inputClass}
                                        >
                                            <option value="Paperback">Paperback</option>
                                            <option value="Hardcover">Hardcover</option>
                                            <option value="Ebook">Ebook</option>
                                            <option value="Audiobook">Audiobook</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="edition"
                                            className={labelClass}
                                        >
                                            Edition
                                        </label>
                                        <input
                                            id="edition"
                                            name="edition"
                                            value={form.edition}
                                            onChange={handleChange}
                                            placeholder="e.g. First Edition"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="price"
                                            className={labelClass}
                                        >
                                            Price
                                        </label>
                                        <input
                                            id="price"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.price}
                                            onChange={handleChange}
                                            placeholder="e.g. 15.99"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="tags"
                                            className={labelClass}
                                        >
                                            Tags
                                        </label>
                                        <input
                                            id="tags"
                                            name="tags"
                                            value={form.tags}
                                            onChange={handleChange}
                                            placeholder="adventure, inspiration, fiction"
                                            className={inputClass}
                                        />
                                        <p className="mt-2 text-xs text-gray-400">
                                            Separate tags with commas.
                                        </p>
                                    </div>
                                </div>
                            </fieldset>

                            <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex flex-1 items-center justify-center gap-2 border border-[#241942] bg-[#241942] px-6 py-4 text-sm font-semibold text-white transition hover:border-[#2F8F70] hover:bg-[#2F8F70] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <LoaderCircle
                                                size={18}
                                                className="animate-spin"
                                            />
                                            Adding book...
                                        </>
                                    ) : (
                                        <>
                                            <BookOpen size={18} />
                                            Add book to collection
                                        </>
                                    )}
                                </button>

                                <Link
                                    to="/"
                                    aria-disabled={loading}
                                    onClick={(event) => {
                                        if (loading) {
                                            event.preventDefault();
                                        }
                                    }}
                                    className="inline-flex items-center justify-center border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-[#241942] transition hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default AddBook;