export interface User {
  id?: string;
  _id?: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin'; 
}