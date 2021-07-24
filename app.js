const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const {
    body,
    validationResult,
    check
} = require('express-validator');

const methodOverride = require('method-override');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

require('./utils/db');
const Book = require('./model/book')

const app = express();
const port = 8000;

// setup method override
app.use(methodOverride('_method'));

// setup ejs
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

// konfigurasi flash
app.use(cookieParser('secret'));
app.use(session({
    cookie: {maxAge: 6000},
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));
app.use(flash());

// halaman home
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Bookshelf Apps',
        layout: 'layouts/main-layout'
    });
});

// halaman menampilkan seluruh buku
app.get('/book', async (req, res) => {
    const books = await Book.find();

    res.render('book', {
        title: 'Daftar Buku',
        layout: 'layouts/main-layout',
        books,
        msg: req.flash('msg')
    });
});

// halaman form tambah buku
app.get('/book/add', (req, res) => {
    res.render('add-book', {
        title: 'Tambah Buku',
        layout: 'layouts/form-layout',
    });
});

// proses tambah buku
app.post(
    '/book',
    [
        body('judul').custom(async (value) => {
            const duplikat = await Book.findOne({
                judul: value,
            });
            if (duplikat) {
                throw new Error('Judul sudah ada!');
            }
            return true;
        }),
        check('tahunTerbit', 'Tahun harus dalam angka').isNumeric(),
        check('jumlahHalaman', 'Jumlah halaman harus dalam angka').isNumeric()
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('add-book', {
                title: 'Tambah Buku',
                layout: 'layouts/form-layout',
                errors: errors.array(),
            });
        } else {
            Book.insertMany(req.body, (error, result) => {
                req.flash('msg', 'Buku berhasil ditambahkan!');
                res.redirect('/book');
            });
        }
    }
)

// delete buku
app.delete('/book', (req, res) => {
    Book.deleteOne({
        judul: req.body.judul
    })
    .then((result) => {
        req.flash('msg', 'Buku berhasil dihapus');
        res.redirect('/book');
    });
})

// halaman form ubah buku
app.get('/book/edit/:judul', async (req,res) => {
    const book = await Book.findOne({
        judul: req.params.judul
    });
    res.render('edit-book', {
        title: 'Ubah Buku',
        layout: 'layouts/form-layout',
        book
    })
})

// proses ubah data
app.put(
    '/book', 
    [
        body('judul').custom(async (value, {req}) => {
            const duplikat = await Book.findOne({
                judul: value
            });
            if (value !== req.body.oldJudul && duplikat) {
                throw new Error('Judul sudah ada!');
            }
            return true;
        }),
        check('tahunTerbit', 'Tahun harus dalam angka').isNumeric(),
        check('jumlahHalaman', 'Jumlah halaman harus dalam angka').isNumeric(),
    ], 
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('edit-book', {
                title: 'Ubah Data Kontak',
                layout: 'layouts/form-layout',
                errors: errors.array(),
                book: req.body,
            });
        } else {
            Book.updateOne(
                { _id: req.body._id },
                {
                    $set: {
                        judul: req.body.judul,
                        penulis: req.body.penulis,
                        tahunTerbit: req.body.tahunTerbit,
                        ringkasan: req.body.ringkasan,
                        jumlahHalaman: req.body.jumlahHalaman,
                    },
                }
            ).then((result) => {
                // kirimkan flash messages
                req.flash('msg', 'Buku berhasil diubah');
                res.redirect('/book');
            });
            
        }
})

// halaman detail buku
app.get('/book/:judul', async (req, res) => {
    const book = await Book.findOne({
        judul: req.params.judul,
    });

    res.render('detail', {
        layout: 'layouts/main-layout',
        title: 'Detail Buku',
        book
    });
})

app.listen(port, () => {
    console.log(`Aplikasi berjalan pada http://localhost:${port}`);
})