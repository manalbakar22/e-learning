import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, retry, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Chapitre, Controle, Module } from '../interfaces/dashboard';


@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private module!: Module;
  private currentChapterIndex: number = 0;
  private currentItemIndex: number = 0;
  private itemsOrder: (keyof Chapitre)[] = [
    'coursPdfPath',
    'videoPath',
    'schema',
    'synthese',
    'quiz',
  ];

  constructor(private http: HttpClient, private router: Router) {}

  getCourseById(id: number): Observable<Module | undefined> {
    console.log('Current Module:', this.module);
    console.log('Requested ID:', id);
    console.log('Module ID:', this.module?.id);
    console.log('ID Match:', this.module?.id === id);
    const token = localStorage.getItem('token');

    // if (this.module?.id === id) {
    //   return of(this.module);
    // }
    return this.http
      .get<Module>(`${environment.apiUrl}/api/module/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        map((data) => {
          this.module = data;
          return data;
        }),
        catchError(this.handleError)
      );
  }
  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError('Something went wrong; please try again later.');
  }

  checkChapter(id: number): Observable<boolean> {
    const token = localStorage.getItem('token');
    return this.http
      .get<any>(`${environment.apiUrl}/api/checkChapter/${id}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        map((data) => {
          this.module = data;
          return data;
        }),
        catchError(this.handleError)
      );
  }

  getQuizByID(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .get(`${environment.apiUrl}/api/Quiz/GetById/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((response) => {
          console.log('Response from backend:', response);
          return response;
        })
      );
  }

  getVdUrlById(id: number): Observable<string | undefined> {
    const token = localStorage.getItem('token');
    return this.http
      .get<any>(`${environment.apiUrl}/api/Chapitre?id=${id}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        map((data) => {
          return data.videoPath;
        }),
        catchError(this.handleError)
      );
  }

  getCourPdfUrlById(id: number): Observable<string | undefined> {
    const token = localStorage.getItem('token');
    return this.http
      .get<any>(`${environment.apiUrl}/api/Chapitre?id=${id}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        map((data) => {
          return data.coursPdfPath;
        }),
        catchError(this.handleError)
      );
  }

  getSyntheseById(id: number): Observable<string | undefined> {
    const token = localStorage.getItem('token');
    return this.http
      .get<any>(`${environment.apiUrl}/api/Chapitre?id=${id}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        map((data) => {
          return data.synthese;
        }),
        catchError(this.handleError)
      );
  }

  getControleById(controleId: number): Observable<Controle | undefined> {
    const token = localStorage.getItem('token');
    return this.http
    .get<any>(`${environment.apiUrl}/api/Controle/${controleId}`,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .pipe(
      map((data) =>{
        return data;
      }),
      catchError(this.handleError)
    )
  }

  getSchemaById(id: number): Observable<string | undefined> {
    const token = localStorage.getItem('token');
    return this.http
    .get<any>(`${environment.apiUrl}/api/Chapitre?id=${id}`,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .pipe(
      map((data) => {
        return data.schema;
      }),
      catchError(this.handleError)
    );
  }

  isVdUrlAvailable(id: number): Observable<boolean> {
    const chapter = this.module.chapitres.find((ch) => ch.id === id);
    const vdUrlExists = chapter ? !!chapter.videoPath : false;
    return of(vdUrlExists);
  }
  getChapterNumber(id: number): Observable<number | null> {
    const chapter = this.module.chapitres.find((ch) => ch.id === id);
    const chapterNum = chapter ? chapter.chapitreNum : null;
    return of(chapterNum);
  }
  getControle(id: number): Observable<boolean> {
    const controle = this.module.controles.find(
      (controle) => Math.max(...controle.chapitreNum) === id
    );
    if (controle) {
      return of(true);
    }
    return of(false);
  }
  getFirstChapterId(id: number): Observable<boolean> {
    const chapterId = this.module.chapitres[0].id;
    if (chapterId === id) return of(true);
    return of(false);
  }

  isLastChapter(id: number): Observable<boolean> {
    const maxchapitreNum = Math.max(
      ...this.module.chapitres.map((chapitre) => chapitre.chapitreNum)
    );
    const chapter = this.module.chapitres.find((chapter) => chapter.id === id);
    if (chapter?.chapitreNum === maxchapitreNum) return of(true);
    return of(false);
  }

  createQuizResult(quizId: number, note: number): Observable<any> {
    const result = { quizId, note };
    const token = localStorage.getItem('token');
    console.log('Object being sent to backend:', result);

    return this.http
      .post<any>(`${environment.apiUrl}/api/QuizResult/Create`, result,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((response) => {
          console.log('Response from backend:', response);
        }),
        catchError(this.handleError)
      );
  }
  uploadSolution(formData: FormData, id: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .post(`${environment.apiUrl}/api/ResultControle/${id}`, formData, {
        responseType: 'text',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((response) => {
          console.log('Response from backend:', response);
        }),
        catchError(this.handleError)
      );
  }
  isDevoirUploaded(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .get(`${environment.apiUrl}/api/ResultControle/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }
  deleteDevoir(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .delete(`${environment.apiUrl}/api/ResultControle/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((response) => {
          return true;
        }),
        catchError(this.handleError)
      );
  }
  getQuizResultById(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .get(`${environment.apiUrl}/api/QuizResult/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((response) => {
          console.log(response);
          return response;
        }),
        catchError(this.handleError)
      );
  }
  updateQuizResult(quizId: number, note: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .get(`${environment.apiUrl}/api/QuizResult/${quizId}/${note}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((response) => {
          console.log(response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getTestNiveau(moduleId : number) : Observable<any>{
    const token = localStorage.getItem('token');
    return this.http
      .get(`${environment.apiUrl}/api/TestNiveau/${moduleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((response) => {
          console.log(response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createTestNiveauScore(moduleId : number , note : number) : Observable<any>{
    const token = localStorage.getItem('token');
    return this.http
      .post<any>(`${environment.apiUrl}/api/TestNiveau/TestResult/${moduleId}/${note}`,{},{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((response) => {
          console.log('Response from backend:', response);
        }),
        catchError(this.handleError)
      );
  }

  getTestNiveauScore(moduleId : number): Observable<any>{
    const token = localStorage.getItem('token');
    return this.http
      .get<any>(`${environment.apiUrl}/api/TestNiveau/GetScore/${moduleId}`,
        {
          headers:{
            Authorization: `Bearer ${token}`,
          }
        }
      ).pipe(
        tap(
          (response) =>{
            console.log('Response from backen is : ', response);
          }
        ),
        catchError(this.handleError)
      )
  }
}
