import React, { useState } from 'react'; 
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { PotholeType } from '../types';

interface AdminViewProps {
  potholes: PotholeType[];
  onResolve: (id: number) => void; 
  onDelete: (id: number) => void; 
}

export default function AdminView({ potholes, onResolve, onDelete }: AdminViewProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<number | null>(null);

  const handleResolve = (id: number) => {
    setLoadingId(id); // Set loading state for UI feedback
    onResolve(id); // Call the resolve function with the pothole ID
  };

  const handleDelete = (id: number) => {
    if (isConfirmingDelete === id) {
      onDelete(id); // Call delete function
      setIsConfirmingDelete(null); // Reset confirmation state
    } else {
      setIsConfirmingDelete(id); // Confirm delete action
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Active Reports</p>
            <p className="text-2xl font-bold text-blue-700">
              {potholes.filter(p => !p.resolved).length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Resolved Issues</p>
            <p className="text-2xl font-bold text-green-700">
              {potholes.filter(p => p.resolved).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {potholes.length === 0 ? (
            <p className="text-center p-4 text-gray-500">No pothole reports available.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Reported</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {potholes.map((pothole) => (
                  <tr key={pothole.id} className={pothole.resolved ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={pothole.image} alt="Pothole" className="h-10 w-10 rounded-full object-cover" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{pothole.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(pothole.date, 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${pothole.severity === 'high' ? 'bg-red-100 text-red-800' :
                          pothole.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'}`}>
                        <AlertCircle size={12} className="mr-1" />
                        {pothole.severity.charAt(0).toUpperCase() + pothole.severity.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${pothole.resolved ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {pothole.resolved ?
                          <>
                            <CheckCircle2 size={12} className="mr-1" /> Verified
                          </> :
                          'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!pothole.resolved && (
                        <button
                          onClick={() => handleResolve(pothole.id)}
                          className={`text-green-600 hover:text-green-900 mx-2 ${loadingId === pothole.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Mark as Verified"
                          disabled={loadingId === pothole.id}
                        >
                          <CheckCircle2 size={20} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(pothole.id)}
                        className="text-red-600 hover:text-red-900 mx-2"
                        title={"Delete Report"}
                        aria-label={`Delete report for ${pothole.location}`}
                      >
                        {isConfirmingDelete === pothole.id ? (
                          <span className="text-red-500">Are you sure?</span>
                        ) : (
                          <XCircle size={20} />
                        )}
                      </button>
                      {isConfirmingDelete === pothole.id && (
                        <button
                          onClick={() => setIsConfirmingDelete(null)}
                          className="text-gray-600 hover:text-gray-900 mx-2"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}