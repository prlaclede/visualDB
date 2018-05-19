import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

import { CommonService } from '../common/common.service';

@Injectable()
export class SpaceService {

  constructor(private _http: Http) { }

  columns: Array<any>; //a list of column present in the current space

  getColumns() {
    return this._http.get('./api/columns').map(res => {
      return res.json();
    });
  }

  getNotes() {
    return this._http.get('./api/notes').map(res => {
      return res.json();
    });
  }

  filterNotes(filter) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this._http.post('./api/filterNotes', filter, options).map(res => {
      return res.json();
    });
  }

  saveNote(note) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this._http.post('./api/note/save', note, options).map(res => {
      return res;
    });
  }

  updateNote(note) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this._http.post('./api/note/update', note, options).map(res => {
      return res;
    });
  }

  archiveNote(noteId) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this._http.post('./api/note/archive', noteId, options).map(res => {
      return res;
    });
  }
}
