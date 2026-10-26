import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';

import { API_URL } from '../../config';

const BOOKS_API = `${API_URL}/api/books`;

const initialForm = {
    title: '',
    author: '',
    description: '',
    isbn: '',
    genre: '',
    publisher: '',
    publishedYear: '',
    language: '',
    pages: '',
    coverImage: '',
    price: '',
    format: '',
    edition: '',
    tags: '',
};

const EditBook = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        const fetchBook = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await fetch(`${BOOKS_API}/${id}`, {
                    signal: controller.signal,
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || 'Failed to load book.'
                    );
                }

                const book = result.data;

                setFormData({
                    title: book.title || '',
                    author: book.author || '',
                    description: book.description || '',
                    isbn: book.isbn || '',
                    genre: book.genre || '',
                    publisher: book.publisher || '',
                    publishedYear: book.publishedYear ?? '',
                    language: book.language || '',
                    pages: book.pages ?? '',
                    coverImage: book.coverImage || '',
                    price: book.price ?? '',
                    format: book.format || '',
                    edition: book.edition || '',
                    tags: Array.isArray(book.tags)
                        ? book.tags.join(', ')
                        : '',
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'Failed to load book.');
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

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.title.trim() || !formData.author.trim()) {
            setError('Title and author are required.');
            return;
        }

        const publishedYear = formData.publishedYear === ''
            ? undefined
            : Number(formData.publishedYear);

        const pages = formData.pages === ''
            ? undefined
            : Number(formData.pages);

        const price = formData.price === ''
            ? undefined
            : Number(formData.price);

        if (
            publishedYear !== undefined &&
            (!Number.isInteger(publishedYear) ||
                publishedYear < 0 ||
                publishedYear > new Date().getFullYear())
        ) {
            setError('Please enter a valid published year.');
            return;
        }

        if (
            pages !== undefined &&
            (!Number.isInteger(pages) || pages < 1)
        ) {
            setError('Pages must be a positive whole number.');
            return;
        }

        if (price !== undefined && (!Number.isFinite(price) || price < 0)) {
            setError('Price cannot be negative.');
            return;
        }

        const payload = {
            title: formData.title.trim(),
            author: formData.author.trim(),
            description: formData.description.trim(),
            isbn: formData.isbn.trim(),
            genre: formData.genre.trim(),
            publisher: formData.publisher.trim(),
            language: formData.language.trim(),
            coverImage: formData.coverImage.trim(),
            format: formData.format.trim(),
            edition: formData.edition.trim(),
            tags: formData.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
        };

        if (publishedYear !== undefined) {
            payload.publishedYear = publishedYear;
        }

        if (pages !== undefined) {
            payload.pages = pages;
        }

        if (price !== undefined) {
            payload.price = price;
        }

        try {
            setSaving(true);

            const response = await fetch(`${BOOKS_API}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Failed to update book.'
                );
            }

            setSuccess('Book updated successfully!');

            setTimeout(() => {
                navigate(`/books/${id}`);
            }, 1000);
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

    if (error && !formData.title && !formData.author) {
        return (
            <main className="mx-auto max-w-3xl px-5 py-20 text-center">
                <p className="text-red-600">{error}</p>
                <Link
                    to="/"
                    className="mt-5 inline-flex items-center gap-2 text-[#2F8F70]"
                >
                    <ArrowLeft size={18} />
                    Back to Library
                </Link>
            </main>
        );
    }

    const fields = [
        { name: 'title', label: 'Book Title', required: true },
        { name: 'author', label: 'Author', required: true },
        { name: 'genre', label: 'Genre' },
        { name: 'isbn', label: 'ISBN' },
        { name: 'publisher', label: 'Publisher' },
        { name: 'publishedYear', label: 'Published Year', type: 'number' },
        { name: 'language', label: 'Language' },
        { name: 'pages', label: 'Number of Pages', type: 'number' },
        { name: 'price', label: 'Price ($)', type: 'number' },
        { name: 'format', label: 'Format' },
        { name: 'edition', label: 'Edition' },
        { name: 'coverImage', label: 'Cover Image URL', type: 'url' },
        { name: 'tags', label: 'Tags', placeholder: 'fiction, classic, adventure' },
    ];

    return (
        <main className="min-h-screen bg-[#F8F7FC] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <Link
                    to={`/books/${id}`}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5C5274] hover:text-[#2F8F70]"
                >
                    <ArrowLeft size={18} />
                    Back to Book Details
                </Link>

                <section className="rounded-3xl border border-[#EAE6F2] bg-white p-5 shadow-sm sm:p-8">
                    <h1 className="text-3xl font-bold text-[#241942]">
                        Edit Book
                    </h1>
                    <p className="mt-2 text-[#756B88]">
                        Update the book information below.
                    </p>

                    {error && (
                        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p role="status" className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                            {success}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="mt-7 space-y-6">
                        <div className="grid gap-5 sm:grid-cols-2">
                            {fields.map((field) => (
                                <div key={field.name}>
                                    <label
                                        htmlFor={field.name}
                                        className="mb-2 block text-sm font-semibold text-[#352B4A]"
                                    >
                                        {field.label}
                                        {field.required && ' *'}
                                    </label>

                                    <input
                                        id={field.name}
                                        name={field.name}
                                        type={field.type || 'text'}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        required={field.required || false}
                                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                        min={field.type === 'number' ? 0 : undefined}
                                        step={field.name === 'price' ? '0.01' : '1'}
                                        className="w-full rounded-xl border border-[#E3DDEC] bg-white px-4 py-3 text-[#352B4A] outline-none transition focus:border-[#2F8F70] focus:ring-2 focus:ring-[#2F8F70]/15"
                                    />
                                </div>
                            ))}
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="mb-2 block text-sm font-semibold text-[#352B4A]"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={5}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Write a short description of the book..."
                                className="w-full rounded-xl border border-[#E3DDEC] px-4 py-3 text-[#352B4A] outline-none transition focus:border-[#2F8F70] focus:ring-2 focus:ring-[#2F8F70]/15"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 border-t border-[#EEEAF4] pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#241942] px-5 py-3 font-semibold text-white transition hover:bg-[#35265A] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <LoaderCircle className="animate-spin" size={18} />
                                ) : (
                                    <Save size={18} />
                                )}
                                {saving ? 'Saving Changes...' : 'Save Changes'}
                            </button>

                            <Link
                                to={`/books/${id}`}
                                className="rounded-xl border border-[#E3DDEC] px-5 py-3 font-semibold text-[#5C5274] transition hover:bg-[#F8F7FC]"
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