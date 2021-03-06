const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

String.prototype.format = function () {
    a = this;
    for (k in arguments) {
        a = a.replace("{" + k + "}", arguments[k])
    }
    return a
}

let knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./local_notes/space.db"
    },
    useNullAsDefault: true
});


// Error handling
const sendError = (err, res) => {
    response.status = 501;
    response.message = typeof err == 'object' ? err.message : err;
    res.status(501).json(response);
};

// Response handling
let response = {
    status: 200,
    data: [],
    message: null
};

// Get columns
router.get('/columns', (req, res) => {
    let notesResults = knex.raw("PRAGMA table_info(SPACE);");
    notesResults.then(function (notes) {
        res.send(notes);
    });
});

// Get notes
router.get('/notes', (req, res) => {
    let notesResults = knex.select("*").from("SPACE").where('STATUS', '=', 'open').orderBy('ID', 'DESC');
    notesResults.then(function (notes) {
        res.send(notes);
    });
});

// Get saved filters
router.get('/filters', (req, res) => {
    let filterResults = knex.select("*").from("FILTERS");
    filterResults.then(function (filters) {
        res.send(filters);
    });
});

router.post('/filterNotes', (req, res) => {
    let filter = req.body;

    let notesSelect = knex.select("*").from("SPACE");

    let noteFilterValue = filter['value'];

    if (filter['column'] && filter['operator'] && filter['value']) {
        if (filter['type'] === 'DATE') {
            noteFilterValue = "datetime('" + filter['value'] + "')";
        }

        if (filter['operator'] === 'like') {
            noteFilterValue = "%" + noteFilterValue + "%";
        }

        notesSelect = notesSelect
            .where(filter['column'], filter['operator'], noteFilterValue);
    }

    if (filter['orderBy'] && filter['order']) {
        notesSelect = notesSelect
            .orderBy(filter['orderBy'], filter['order']);
    } else {
        notesSelect = notesSelect.orderBy('ID', 'DESC');
    }

    notesSelect.then(function (filteredNotes) {
        res.send(filteredNotes);
    });
});

router.post('/note/save', function (req, res) {
    let note = req.body;
    let noteSave = knex("SPACE")
        .insert({
            DATE: note.DATE,
            TITLE: note.TITLE,
            NOTE: note.NOTE,
            PARENT: note.PARENT
        });
    noteSave.then(function (noteId) {
        res.send(noteId);
    }).catch(function (err) {
        console.log(err);
        res.sendStatus(500)
    });
});

router.post('/note/update', function (req, res) {
    let note = req.body;
    let noteUpdate = knex("SPACE").where("ID", "=", note.ID)
        .update({
            DATE: note.DATA,
            TITLE: note.TITLE,
            NOTE: note.NOTE,
            PARENT: note.PARENT
        });

    noteUpdate.then(function () {
        res.sendStatus(200);
    }).catch(function (err) {
        console.log(err);
        res.sendStatus(500)
    });
});

router.post('/note/archive', function (req, res) {
    let note = req.body;
    let noteArchive = knex("SPACE").where("ID", "=", note.ID)
        .update({
            STATUS: 'archived'
        });

    noteArchive.then(function () {
        res.sendStatus(200);
    }).catch(function (err) {
        console.log(err);
        res.sendStatus(500)
    });
});

router.post('/filter/save', function (req, res) {
    let filter = req.body;
    console.log(filter);
    let filterSave = knex("FILTERS")
        .insert({
            NAME: filter.name,
            COLUMN: filter.column,
            OPERATOR: filter.operator,
            VALUE: filter.value,
            DEFAULT: filter.defaultFilter
        });
    filterSave.then(function (filterId) {
        res.send(filterId);
    }).catch(function (err) {
        console.log(err);
        res.sendStatus(500)
    });
});

router.post('/filter/delete', function (req, res) {
    let note = req.body;
    let filterArchive = knex("FILTER").where("ID", "=", filter.ID).del()
        .update({
            STATUS: 'archived'
        });

    filterArchive.then(function () {
        res.sendStatus(200);
    }).catch(function (err) {
        console.log(err);
        res.sendStatus(500)
    });
});

module.exports = router;