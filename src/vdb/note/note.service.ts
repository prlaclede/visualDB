import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import * as _ from 'lodash';

import { SpaceService } from '../space/space.service';
import { CommonService } from '../common/common.service';

@Injectable()
export class NoteService {

    constructor(private _http: Http, private _cs: CommonService, private _ss: SpaceService) { }

    newNoteIndex: number; //an index of new notes added to the form
    notesFormGroup = new FormGroup({}); //a formGroup for all the notes on the page
    newNotesFormGroup = new FormGroup({}); //a formGroup for all the new notes on the page
    noteProperties: Array<any>; //a list of objects containing various note status (saving, etc...)

    initNoteForms() {
        this.newNoteIndex = 1;
        this.noteProperties = new Array();
        this.noteProperties['notes'] = new Array();
        this.noteProperties['newNotes'] = new Array();

        this.notesFormGroup = new FormGroup({});

        _.each(this._ss.data['notes'], (note) => {
            this.noteProperties['notes'][note.ID] = new Array();
            this.noteProperties['notes'][note.ID]['saving'] = false;
            this.notesFormGroup.controls[note.ID] = new FormGroup({
                ID: new FormControl(note.ID),
                DATE: new FormControl(this._cs.getDate(note.DATE)),
                TITLE: new FormControl(note.TITLE),
                NOTE: new FormControl(note.NOTE),
                PARENT: new FormControl(note.PARENT)
            });
        });

        // let notesTree = this.makeNotesTree();
    }

    // makeNotesTree() {
    //     var groupedNotes = _.groupBy(this.notes, 'PARENT');
    //     _.each(_.omit(groupedNotes, ['', 'null']), (children, parentId) => {
    //         let parentNoteFormGroup = this.notesFormGroup.controls[parentId]['controls'];
    //         parentNoteFormGroup.children = new FormGroup({});

    //         _.each(children, (child) => {
    //             parentNoteFormGroup.children.controls[child.ID] = this.notesFormGroup.controls[child.ID];
    //             this.notesFormGroup.removeControl(child.ID);
    //         });
    //     });

    //     console.log(this.notesFormGroup);
    //     return groupedNotes;
    // }

    getNotesArray(controlGroup) {
        return Object.keys(controlGroup.controls);
    }

    addNote() {
        this.noteProperties['newNotes'][this.newNoteIndex] = new Array();
        this.noteProperties['newNotes'][this.newNoteIndex]['saving'] = false;
        this.newNotesFormGroup.controls[this.newNoteIndex] = new FormGroup({
            ID: new FormControl(this.newNoteIndex),
            DATE: new FormControl(new Date()),
            TITLE: new FormControl(),
            NOTE: new FormControl(),
            PARENT: new FormControl()
        });

        this.newNoteIndex += 1;
    }

    saveNote(noteFG) {
        let newNoteValue = noteFG.value;
        this.noteProperties['newNotes'][newNoteValue['ID']]['saving'] = true;
        this._ss.saveNote(newNoteValue)
            .subscribe(res => {
                if (res.status === 200) {
                    let noteId = JSON.parse(res['_body'])[0];
                    this.noteProperties['newNotes'][newNoteValue['ID']]['saving'] = false;
                    this.deleteNewNote(noteFG);
                    /* add to the notes FormGroup */
                    this.notesFormGroup.controls[noteId] = new FormGroup({
                        ID: new FormControl(noteId),
                        DATE: new FormControl(this._cs.getDate(newNoteValue.DATE)),
                        TITLE: new FormControl(newNoteValue.TITLE),
                        NOTE: new FormControl(newNoteValue.NOTE),
                        PARENT: new FormControl(newNoteValue.PARENT)
                    });
                    /* add to the noteProperties array */
                    this.noteProperties['notes'][noteId] = new Array();
                    this.noteProperties['notes'][noteId]['saving'] = false;
                    /* add to the notes array */
                    let newNoteObj = {
                        ID: noteId,
                        DATE: newNoteValue.DATE,
                        TITLE: newNoteValue.TITLE,
                        NOTE: newNoteValue.NOTE,
                        PARENT: newNoteValue.PARENT
                    }

                    // if (ASC) {
                    this._ss.data['notes'].push(newNoteObj);
                    // } else { DESC
                    // this.notes.unshift(newNoteObj);
                    // }
                    console.log(this.noteProperties);
                } else {
                    this.noteProperties['newNotes'][newNoteValue['ID']]['saving'] = false;
                }
            });
    }

    updateNote(noteFG) {
        let noteId = noteFG.controls.ID.value;
        this.noteProperties['notes'][noteId]['saving'] = true;
        this._ss.updateNote(noteFG.value)
            .subscribe(res => {
                if (res.status === 200) {
                    this.noteProperties['notes'][noteId]['saving'] = false;
                } else {
                    this.noteProperties['notes'][noteId]['saving'] = false;
                }
            });
    }

    deleteNewNote(noteFG) {
        let noteId = noteFG.controls.ID.value;
        this.newNotesFormGroup.removeControl(noteId);
        this.newNoteIndex -= 1;
    }

    deleteSavedNote(noteFG) {
        let noteId = noteFG.controls.ID.value;
        let noteIndex = _.findKey(this._ss.data['notes'], { ID: noteId });
        this._ss.data['notes'].splice(noteIndex, 1);
        this.notesFormGroup.removeControl(noteId);
        this._ss.archiveNote(noteId);
    }

}
