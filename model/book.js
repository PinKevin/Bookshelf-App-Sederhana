const mongoose = require('mongoose');

// Membuat Schema
const Book = mongoose.model('Book', {
    judul: {
        type: String,
        required: true,
    },
    penulis: {
        type: String,
        required: true,
    },
    tahunTerbit: {
        type: String,
        required: true,
    },
    jumlahHalaman: {
        type: String,
        required: true,
    },
    ringkasan: {
        type: String
    }
});

module.exports = Book;