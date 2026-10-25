import React from 'react';
import { useParams } from 'react-router';

const BookDetails = () => {
    const { id } = useParams();

    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold text-[#241942]">
                Book Details
            </h1>

            <p className="mt-3 text-gray-600">
                Book ID: {id}
            </p>
        </main>
    );
};

export default BookDetails;