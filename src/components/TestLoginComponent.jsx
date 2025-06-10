// Script para probar el login con el usuario elena/lopez directamente desde el navegador
import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';

function TestLoginComponent() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function testLogin() {
      setLoading(true);
      try {
        const userData = await userService.login('elena', 'lopez');
        setResult(userData);
        setDone(true);
      } catch (err) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    
    testLogin();
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto my-8 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Test de Login (elena/lopez)</h1>
      
      {loading && (
        <div className="my-4 flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
          <span>Probando login...</span>
        </div>
      )}
      
      {error && (
        <div className="my-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {done && !error && (
        <div className="my-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded">
          <strong>¡Login exitoso!</strong>
        </div>
      )}
      
      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Datos del usuario:</h2>
          <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6">
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
        {' '}
        <button 
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          onClick={() => window.history.back()}
        >
          Volver
        </button>
      </div>
    </div>
  );
}

export default TestLoginComponent;
