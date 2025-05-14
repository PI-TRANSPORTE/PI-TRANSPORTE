import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface StudentAddress {
  house_number: string;
  street: string;
  city: string;
  district: string;
}

interface Student {
  id?: number;
  name: string;
  shift: string;
  address: StudentAddress;
  geolocation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private apiUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient) {}

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/students`);
  }

  getStudentsByShift(shift: string): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/students?shift=${shift}`);
  }

  createStudent(studentData: Student): Observable<Student> {
    return this.http.post<Student>(`${this.apiUrl}/students`, studentData);
  }

  updateStudent(id: number, newData: Partial<Student>): Observable<Student> {
    return this.http.patch<Student>(`${this.apiUrl}/students/${id}`, newData);
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/students/${id}`);
  }
}