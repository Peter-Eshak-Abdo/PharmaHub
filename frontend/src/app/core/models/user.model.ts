export interface User {
  _id?: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin'; 
}