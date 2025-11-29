import React, { useState } from 'react';
import { User } from '../types';
import { fetchFromSheets, syncToSheets, DBData } from '../services/googleSheetsService';

interface AuthProps {
  onLogin: (user: User, dbUrl: string, initialData: DBData) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [dbUrl, setDbUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUrl) {
        setError('Por favor ingresa la URL de tu Google Apps Script.');
        return;
    }
    if (!formData.phone || !formData.password || (isRegistering && !formData.name)) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    setIsLoading(true);

    try {
        // 1. Fetch current DB state from Cloud
        const data = await fetchFromSheets(dbUrl);
        
        if (!data) {
            setError('Error de conexión. Verifica que la URL termine en "/exec" y que los permisos sean "Cualquier usuario" (Anyone).');
            setIsLoading(false);
            return;
        }

        const usersDB = data.users || [];

        if (isRegistering) {
          // Check if user already exists
          const existingUser = usersDB.find(u => u.phone === formData.phone);
          if (existingUser) {
            setError('Este número de celular ya está registrado.');
            setIsLoading(false);
            return;
          }

          // Create new user
          const newUser: User = { 
            name: formData.name, 
            phone: formData.phone, 
            password: formData.password 
          };
          
          // 2. Add to Local DB image
          const updatedUsers = [...usersDB, newUser];
          const updatedData: DBData = {
              ...data,
              users: updatedUsers
          };

          // 3. Sync back to Cloud
          const saveSuccess = await syncToSheets(dbUrl, updatedData);

          if (saveSuccess) {
            setSuccessMsg('Usuario registrado. Iniciando sesión...');
            setTimeout(() => {
                onLogin(newUser, dbUrl, updatedData);
            }, 1000);
          } else {
            setError('Error al guardar el usuario en la base de datos.');
          }

        } else {
          // Login Logic
          const user = usersDB.find(u => u.phone === formData.phone && u.password === formData.password);
          
          if (user) {
            onLogin(user, dbUrl, data);
          } else {
            setError('Número celular o contraseña incorrectos.');
          }
        }
      } catch (err) {
        console.error(err);
        setError('Ocurrió un error inesperado de red.');
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 bg-white overflow-y-auto">
      <div className="w-full max-w-sm py-8">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">GeminiMsg</h1>
        <p className="text-center text-gray-500 mb-8">
            Base de Datos en Google Sheets
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-md mb-4">
                <label className="block text-xs font-bold text-blue-800 uppercase mb-1">URL de Google Apps Script</label>
                <input
                    type="url"
                    value={dbUrl}
                    onChange={(e) => setDbUrl(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-blue-200 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-xs"
                    placeholder="https://script.google.com/macros/s/.../exec"
                />
                <p className="text-[10px] text-blue-600 mt-2 leading-tight">
                  Asegúrate de que al implementar seleccionaste: <br/>
                  <strong>Acceso: "Cualquier usuario" (Anyone)</strong>
                </p>
            </div>

            <div className="border-t border-gray-100 my-4"></div>

          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Celular</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="55 1234 5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100">{error}</p>}
          {successMsg && <p className="text-green-600 text-sm bg-green-50 p-2 rounded border border-green-100">{successMsg}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-wait"
          >
            {isLoading ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : (
              isRegistering ? 'Registrarse' : 'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSuccessMsg('');
            }}
            className="text-sm text-primary hover:underline"
          >
            {isRegistering
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;