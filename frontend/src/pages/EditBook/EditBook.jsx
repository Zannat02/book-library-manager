import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
    ArrowLeft,
    LoaderCircle,
    Save,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
} from 'lucide-react';

import { API_URL } from '../../config';
import { request } from '../../utils/api';

const BOOKS_API = `${API_URL}/api/books`;

const GENRES = [
    'Fiction', 'Fantasy', 'Science', 'Mystery', 'Romance',
    'Biography', 'Adventure', 'History', 'Self-help', 'Uncategorized',
];
const FORMATS = ['Paperback', 'Hardcover', 'Ebook', 'Audiobook'];

const initialForm = {
    title: '', author: '', description: '', isbn: '', genre: 'Uncategorized',
    publisher: '', publishedYear: '', language: '', pages: '', coverImage: '',
    price: '', format: 'Paperback', edition: '', tags: '',
};

// Empty input -> null, so a cleared number field is really cleared.
const toNumberOrNull = (value) =>
    String(value).trim() === '' ? null : Number(value);

const EditBook = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const redirectTimer = useRef(null);

    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => () => clearTimeout(redirectTimer.current), []);

    useEffect(() => {
        const controller = new AbortController();

        const fetchBook = async () => {
            try {
                setLoading(true);
                setLoadError('');

                const { data: book } = await request(`${BOOKS_API}/${id}`, {
                    signal: controller.signal,
                });

                setFormData({
                    title: book.title || '',
                    author: book.author || '',
                    description: book.description || '',
                    isbn: book.isbn || '',
                    genre: book.genre || 'Uncategorized',
                    publisher: book.publisher || '',
                    publishedYear: book.publishedYear ?? '',
                    language: book.language || '',
                    pages: book.pages ?? '',
                    coverImage: book.coverImage || '',
                    price: book.price ?? '',
                    format: book.format || 'Paperback',
                    edition: book.edition || '',
                    tags: Array.isArray(book.tags) ? book.tags.join(', ') : '',
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setLoadError(err.message || 'Failed to load book.');
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchBook();
        return () => controller.abort();
    }, [id, reloadKey]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (saving || success) return;

        setError('');

        if (!formData.title.trim() || !formData.author.trim()) {
            setError('Title and author are required.');
            return;
        }

        const publishedYear = toNumberOrNull(formData.publishedYear);
        const pages = toNumberOrNull(formData.pages);
        const price = toNumberOrNull(formData.price);

        if (
            (publishedYear !== null &&
                (!Number.isInteger(publishedYear) || publishedYear < 0)) ||
            (pages !== null && (!Number.isInteger(pages) || pages < 1)) ||
            (price !== null && (!Number.isFinite(price) || price < 0))
        ) {
            setError('Please enter a valid publication year, page count, and price.');
            return;
        }

        const payload = {
            title: formData.title.trim(),
            author: formData.author.trim(),
            description: formData.description.trim(),
            isbn: formData.isbn.trim(),
            genre: formData.genre,
            publisher: formData.publisher.trim(),
            language: formData.language.trim(),
            coverImage: formData.coverImage.trim(),
            format: formData.format,
            edition: formData.edition.trim(),
            publishedYear,
            pages,
            price,
            tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        };

        try {
            setSaving(true);

            await request(`${BOOKS_API}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            setSuccess('Book updated successfully!');
            redirectTimer.current = setTimeout(
                () => navigate(`/books/${id}`),
                1000
            );
        } catch (err) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-3 text-[#2F8F70]">
                    <LoaderCircle className="animate-spin" size={24} />
                    <span>Loading book information...</span>
                </div>
            </main>
        );
    }

    if (loadError) {
        return (
            <main className="mx-auto max-w-3xl px-5 py-20 text-center">
                <AlertCircle className="mx-auto mb-4 text-red-500" size={42} />
                <h1 className="text-2xl font-bold text-[#241942]">Unable to load book</h1>
                <p className="mt-3 text-gray-500">{loadError}</p>
                <div className="mt-6 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => setReloadKey((k) => k + 1)}
                        className="inline-flex items-center gap-2 bg-[#241942] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2F8F70]"
                    >
                        <RefreshCw size={16} />
                        Try again
                    </button>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 border border-gray-200 px-5 py-3 text-sm font-semibold text-[#241942]"
                    >
                        <ArrowLeft size={16} />
                        Back to library
                    </Link>
                </div>
            </main>
        );
    }

    const inputClass =
        'w-full border border-[#E3DDEC] bg-white px-4 py-3 text-sm text-[#352B4A] outline-none transition focus:border-[#2F8F70] disabled:bg-gray-50';
    const labelClass = 'mb-2 block text-sm font-semibold text-[#352B4A]';

    const text = (name, label, extra = {}) => (
        <div key={name}>
            <label htmlFor={name} className={labelClass}>
                {label}{extra.required && ' *'}
            </label>
            <input
                id={name}
                name={name}
                type={extra.type || 'text'}
                value={formData[name]}
                onChange={handleChange}
                min={extra.type === 'number' ? 0 : undefined}
                step={name === 'price' ? '0.01' : extra.type === 'number' ? '1' : undefined}
                placeholder={extra.placeholder}
                className={inputClass}
            />
        </div>
    );

    const select = (name, label, options) => {
        const list = options.includes(formData[name])
            ? options
            : [formData[name], ...options].filter(Boolean);
        return (
            <div key={name}>
                <label htmlFor={name} className={labelClass}>{label}</label>
                <select
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={inputClass}
                >
                    {list.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-[#FAF9F6] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <Link
                    to={`/books/${id}`}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#2F8F70]"
                >
                    <ArrowLeft size={18} />
                    Back to book details
                </Link>

                <section className="bg-white p-5 shadow-sm sm:p-8">
                    <h1 className="text-3xl font-bold text-[#241942]">Edit book</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Update the book information below.
                    </p>

                    {error && (
                        <div role="alert" className="mt-5 flex gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <AlertCircle size={19} className="shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {success && (
                        <div role="status" className="mt-5 flex gap-3 border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                            <CheckCircle2 size={19} className="shrink-0" />
                            <p>{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-6">
                        <fieldset disabled={saving || Boolean(success)} className="min-w-0 space-y-6 disabled:opacity-80">
                            <div className="grid gap-5 sm:grid-cols-2">
                                {text('title', 'Book title', { required: true })}
                                {text('author', 'Author', { required: true })}
                                {select('genre', 'Genre', GENRES)}
                                {select('format', 'Format', FORMATS)}
                                {text('isbn', 'ISBN')}
                                {text('publisher', 'Publisher')}
                                {text('publishedYear', 'Publication year', { type: 'number' })}
                                {text('pages', 'Number of pages', { type: 'number' })}
                                {text('language', 'Language')}
                                {text('edition', 'Edition')}
                                {text('price', 'Price ($)', { type: 'number' })}
                                {text('coverImage', 'Cover image URL', { type: 'url' })}
                                <div className="sm:col-span-2">
                                    {text('tags', 'Tags', { placeholder: 'fiction, classic, adventure' })}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="description" className={labelClass}>Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={5}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                        </fieldset>

                        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
                            <button
                                type="submit"
                                disabled={saving || Boolean(success)}
                                className="inline-flex items-center justify-center gap-2 border border-[#241942] bg-[#241942] px-6 py-3 text-sm font-semibold text-white transition hover:border-[#2F8F70] hover:bg-[#2F8F70] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}
                                {saving ? 'Saving changes...' : 'Save changes'}
                            </button>

                            <Link
                                to={`/books/${id}`}
                                className="border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-[#241942] transition hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
};

export default EditBook;