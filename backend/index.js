const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not configured.');
}

const client = new MongoClient(MONGODB_URI || 'mongodb://127.0.0.1:27017');

let booksCollection;
let connectionPromise;

async function connectDB() {
    if (!connectionPromise) {
        connectionPromise = client.connect()
            .then(async () => {
                console.log('MongoDB connected successfully!');

                const db = client.db('bookLibraryDB');
                booksCollection = db.collection('books');

                // Unique ISBN (ignores books that have no ISBN).
                // Non-fatal: if old duplicate ISBNs exist, the API still works.
                try {
                    await booksCollection.createIndex(
                        { isbn: 1 },
                        {
                            unique: true,
                            partialFilterExpression: { isbn: { $gt: '' } }
                        }
                    );
                } catch (indexError) {
                    console.warn(
                        'Could not create unique ISBN index:',
                        indexError.message
                    );
                }
            })
            .catch((error) => {
                connectionPromise = null;
                throw error;
            });
    }

    await connectionPromise;
}

// Validate optional fields (numbers, tags, string fields).
// Returns an error message, or null if everything is valid.
const STRING_FIELDS = [
    'description',
    'genre',
    'publisher',
    'language',
    'coverImage',
    'format',
    'edition'
];

function validateOptional(data) {
    const { publishedYear, pages, price, tags } = data;

    if (
        publishedYear != null &&
        (!Number.isInteger(publishedYear) || publishedYear < 0)
    ) {
        return 'Published year must be a non-negative whole number.';
    }

    if (pages != null && (!Number.isInteger(pages) || pages < 1)) {
        return 'Pages must be a positive whole number.';
    }

    if (
        price != null &&
        (typeof price !== 'number' || !Number.isFinite(price) || price < 0)
    ) {
        return 'Price must be a non-negative number.';
    }

    if (
        tags !== undefined &&
        (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string'))
    ) {
        return 'Tags must be an array of strings.';
    }

    for (const field of STRING_FIELDS) {
        if (data[field] !== undefined && typeof data[field] !== 'string') {
            return `${field} must be a string.`;
        }
    }

    return null;
}

// Connect to MongoDB before processing API requests.
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);

        res.status(500).json({
            success: false,
            message: 'Database connection failed.'
        });
    }
});

// GET all books with search, genre filter and pagination.
app.get('/api/books', async (req, res) => {
    try {
        const { search, genre } = req.query;

        const page = Math.max(
            1,
            parseInt(req.query.page, 10) || 1
        );

        const limit = Math.min(
            50,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        const skip = (page - 1) * limit;
        const query = {};

        if (search && typeof search === 'string') {
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            );

            query.$or = [
                { title: { $regex: escapedSearch, $options: 'i' } },
                { author: { $regex: escapedSearch, $options: 'i' } }
            ];
        }

        if (genre && typeof genre === 'string') {
            const escapedGenre = genre.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            );

            query.genre = {
                $regex: `^${escapedGenre}$`,
                $options: 'i'
            };
        }

        const [books, total] = await Promise.all([
            booksCollection
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),

            booksCollection.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            message: 'Books fetched successfully.',
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: books
        });
    } catch (error) {
        console.error('Error fetching books:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch books.'
        });
    }
});

// GET a single book by ID.
app.get('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid book ID.'
            });
        }

        const book = await booksCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Book fetched successfully.',
            data: book
        });
    } catch (error) {
        console.error('Error fetching book:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch book.'
        });
    }
});

// CREATE a new book.
app.post('/api/books', async (req, res) => {
    try {
        const {
            title,
            author,
            description,
            isbn,
            genre,
            publisher,
            publishedYear,
            language,
            pages,
            coverImage,
            price,
            format,
            edition,
            tags
        } = req.body;

        if (
            typeof title !== 'string' ||
            !title.trim() ||
            typeof author !== 'string' ||
            !author.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Title and author are required.'
            });
        }

        const optionalError = validateOptional({
            description,
            genre,
            publisher,
            publishedYear,
            language,
            pages,
            coverImage,
            price,
            format,
            edition,
            tags
        });

        if (optionalError) {
            return res.status(400).json({
                success: false,
                message: optionalError
            });
        }

        const normalizedIsbn = typeof isbn === 'string'
            ? isbn.trim()
            : '';

        if (normalizedIsbn) {
            const existingBook = await booksCollection.findOne({
                isbn: normalizedIsbn
            });

            if (existingBook) {
                return res.status(409).json({
                    success: false,
                    message: 'A book with this ISBN already exists.'
                });
            }
        }

        const currentDate = new Date();

        const newBook = {
            title: title.trim(),
            author: author.trim(),
            description: typeof description === 'string'
                ? description.trim()
                : '',
            isbn: normalizedIsbn,
            genre: typeof genre === 'string' && genre.trim()
                ? genre.trim()
                : 'Uncategorized',
            publisher: typeof publisher === 'string'
                ? publisher.trim()
                : '',
            publishedYear: publishedYear ?? null,
            language: typeof language === 'string' && language.trim()
                ? language.trim()
                : 'English',
            pages: pages ?? null,
            coverImage: typeof coverImage === 'string'
                ? coverImage.trim()
                : '',
            price: price ?? null,
            format: typeof format === 'string' && format.trim()
                ? format.trim()
                : 'Paperback',
            edition: typeof edition === 'string'
                ? edition.trim()
                : '',
            tags: Array.isArray(tags)
                ? tags.map((tag) => tag.trim()).filter(Boolean)
                : [],
            rating: 0,
            totalRatings: 0,
            createdAt: currentDate,
            updatedAt: currentDate
        };

        const result = await booksCollection.insertOne(newBook);

        res.status(201).json({
            success: true,
            message: 'Book added successfully.',
            data: {
                _id: result.insertedId,
                ...newBook
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'A book with this ISBN already exists.'
            });
        }

        console.error('Error adding book:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to add book.'
        });
    }
});

// UPDATE a book.
app.patch('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid book ID.'
            });
        }

        const allowedFields = [
            'title',
            'author',
            'description',
            'isbn',
            'genre',
            'publisher',
            'publishedYear',
            'language',
            'pages',
            'coverImage',
            'price',
            'format',
            'edition',
            'tags'
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided to update.'
            });
        }

        if (
            ('title' in updates &&
                (typeof updates.title !== 'string' || !updates.title.trim())) ||
            ('author' in updates &&
                (typeof updates.author !== 'string' || !updates.author.trim()))
        ) {
            return res.status(400).json({
                success: false,
                message: 'Title and author must be non-empty strings.'
            });
        }

        const optionalError = validateOptional(updates);

        if (optionalError) {
            return res.status(400).json({
                success: false,
                message: optionalError
            });
        }

        if ('title' in updates) {
            updates.title = updates.title.trim();
        }

        if ('author' in updates) {
            updates.author = updates.author.trim();
        }

        if ('tags' in updates) {
            updates.tags = updates.tags
                .map((tag) => tag.trim())
                .filter(Boolean);
        }

        if ('isbn' in updates) {
            if (typeof updates.isbn !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'ISBN must be a string.'
                });
            }

            updates.isbn = updates.isbn.trim();

            if (updates.isbn) {
                const existingBook = await booksCollection.findOne({
                    isbn: updates.isbn,
                    _id: { $ne: new ObjectId(id) }
                });

                if (existingBook) {
                    return res.status(409).json({
                        success: false,
                        message: 'A book with this ISBN already exists.'
                    });
                }
            }
        }

        updates.updatedAt = new Date();

        const result = await booksCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found.'
            });
        }

        const updatedBook = await booksCollection.findOne({
            _id: new ObjectId(id)
        });

        res.status(200).json({
            success: true,
            message: 'Book updated successfully.',
            data: updatedBook
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'A book with this ISBN already exists.'
            });
        }

        console.error('Error updating book:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to update book.'
        });
    }
});

// SUBMIT a rating for a book.
app.patch('/api/books/:id/rating', async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid book ID.'
            });
        }

        if (
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be an integer between 1 and 5.'
            });
        }

        const bookObjectId = new ObjectId(id);

        const updatedBook = await booksCollection.findOneAndUpdate(
            { _id: bookObjectId },
            [
                {
                    $set: {
                        rating: {
                            $round: [
                                {
                                    $divide: [
                                        {
                                            $add: [
                                                {
                                                    $multiply: [
                                                        { $ifNull: ['$rating', 0] },
                                                        { $ifNull: ['$totalRatings', 0] }
                                                    ]
                                                },
                                                rating
                                            ]
                                        },
                                        {
                                            $add: [
                                                { $ifNull: ['$totalRatings', 0] },
                                                1
                                            ]
                                        }
                                    ]
                                },
                                1
                            ]
                        },
                        totalRatings: {
                            $add: [
                                { $ifNull: ['$totalRatings', 0] },
                                1
                            ]
                        },
                        updatedAt: new Date()
                    }
                }
            ],
            { returnDocument: 'after' }
        );

        if (!updatedBook) {
            return res.status(404).json({
                success: false,
                message: 'Book not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Rating submitted successfully.',
            data: updatedBook
        });
    } catch (error) {
        console.error('Error submitting rating:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to submit rating.'
        });
    }
});

// DELETE a book.
app.delete('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid book ID.'
            });
        }

        const result = await booksCollection.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Book deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting book:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to delete book.'
        });
    }
});

// API health route.
app.get('/', (req, res) => {
    res.status(200).send('Book Library Manager API is running!');
});

// Start a local server only when running this file directly.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;