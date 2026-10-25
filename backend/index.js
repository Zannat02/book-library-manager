const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const client = new MongoClient(MONGODB_URI);

async function startServer() {
    try {
        await client.connect();

        console.log('MongoDB connected successfully!');

        const db = client.db('bookLibraryDB');
        const booksCollection = db.collection('books');
        const reviewsCollection = db.collection('bookReviews');






app.get('/api/books', async (req, res) => {
  try {
    const { search, genre } = req.query;

    // Pagination
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    // Search and filter query
    const query = {};

    if (search && typeof search === 'string') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre && typeof genre === 'string') {
      query.genre = {
        $regex: `^${genre}$`,
        $options: 'i'
      };
    }

    // Fetch books and count matching documents
    const [books, total] = await Promise.all([
      booksCollection
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray(),

      booksCollection.countDocuments(query)
    ]);

    // Success response
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







        app.get('/api/books/:id', async (req, res) => {
            try {
                const { ObjectId } = require('mongodb');
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



        app.patch('/api/books/:id', async (req, res) => {
            try {
                const { ObjectId } = require('mongodb');
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

                if ('title' in updates) updates.title = updates.title.trim();
                if ('author' in updates) updates.author = updates.author.trim();

                if (updates.isbn) {
                    updates.isbn = updates.isbn.trim();

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
                console.error('Error updating book:', error.message);

                res.status(500).json({
                    success: false,
                    message: 'Failed to update book.'
                });
            }
        });


        
     
        // Get all reviews for a book
        app.get('/api/books/:id/reviews', async (req, res) => {
            try {
                const { ObjectId } = require('mongodb');
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

                const reviews = await reviewsCollection
                    .find({ bookId: new ObjectId(id) })
                    .sort({ createdAt: -1 })
                    .toArray();

                return res.status(200).json({
                    success: true,
                    message: 'Reviews fetched successfully.',
                    data: reviews
                });
            } catch (error) {
                console.error('Error fetching reviews:', error.message);

                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch reviews.'
                });
            }
        });


        // Submit a rating, a written review, or both
        app.post('/api/books/:id/reviews', async (req, res) => {
            try {
                const { ObjectId } = require('mongodb');
                const { id } = req.params;
                const { rating, review } = req.body;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid book ID.'
                    });
                }

                const hasRating = rating !== undefined && rating !== null;
                const hasReview =
                    typeof review === 'string' && review.trim().length > 0;

                if (!hasRating && !hasReview) {
                    return res.status(400).json({
                        success: false,
                        message: 'Provide a rating, a written review, or both.'
                    });
                }

                if (
                    hasRating &&
                    (!Number.isInteger(rating) || rating < 1 || rating > 5)
                ) {
                    return res.status(400).json({
                        success: false,
                        message: 'Rating must be an integer between 1 and 5.'
                    });
                }

                if (hasReview && review.trim().length > 1000) {
                    return res.status(400).json({
                        success: false,
                        message: 'Review must not exceed 1000 characters.'
                    });
                }

                const bookObjectId = new ObjectId(id);

                const book = await booksCollection.findOne({
                    _id: bookObjectId
                });

                if (!book) {
                    return res.status(404).json({
                        success: false,
                        message: 'Book not found.'
                    });
                }

                const newReview = {
                    bookId: bookObjectId,
                    ...(hasRating ? { rating } : {}),
                    ...(hasReview ? { review: review.trim() } : {}),
                    createdAt: new Date()
                };

                const result = await reviewsCollection.insertOne(newReview);

                // Recalculate the average from all submitted ratings
                const ratingStats = await reviewsCollection
                    .aggregate([
                        {
                            $match: {
                                bookId: bookObjectId,
                                rating: { $exists: true }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                averageRating: { $avg: '$rating' },
                                totalRatings: { $sum: 1 }
                            }
                        }
                    ])
                    .toArray();

                const stats = ratingStats[0] || {
                    averageRating: 0,
                    totalRatings: 0
                };

                await booksCollection.updateOne(
                    { _id: bookObjectId },
                    {
                        $set: {
                            rating: Number(stats.averageRating.toFixed(1)),
                            totalRatings: stats.totalRatings,
                            updatedAt: new Date()
                        }
                    }
                );

                const savedReview = await reviewsCollection.findOne({
                    _id: result.insertedId
                });

                const updatedBook = await booksCollection.findOne({
                    _id: bookObjectId
                });

                return res.status(201).json({
                    success: true,
                    message: 'Your rating/review was submitted successfully.',
                    data: {
                        review: savedReview,
                        book: updatedBook
                    }
                });
            } catch (error) {
                console.error('Error submitting review:', error.message);

                return res.status(500).json({
                    success: false,
                    message: 'Failed to submit rating/review.'
                });
            }
        });





        app.delete('/api/books/:id', async (req, res) => {
            try {
                const { ObjectId } = require('mongodb');
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

                // Validate required fields
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

                // Prevent duplicate ISBN
                if (isbn) {
                    const existingBook = await booksCollection.findOne({
                        isbn: isbn.trim()
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
                    description: description?.trim() || '',
                    isbn: isbn?.trim() || '',
                    genre: genre?.trim() || 'Uncategorized',
                    publisher: publisher?.trim() || '',
                    publishedYear: publishedYear ?? null,
                    language: language?.trim() || 'English',
                    pages: pages ?? null,
                    coverImage: coverImage?.trim() || '',
                    price: price ?? null,
                    format: format?.trim() || 'Paperback',
                    edition: edition?.trim() || '',
                    tags: Array.isArray(tags) ? tags : [],
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
                console.error('Error adding book:', error.message);

                res.status(500).json({
                    success: false,
                    message: 'Failed to add book.'
                });
            }
        });


        app.get('/', (req, res) => {
            res.send('Book Library Manager API is running!');
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
    }
}

startServer();
