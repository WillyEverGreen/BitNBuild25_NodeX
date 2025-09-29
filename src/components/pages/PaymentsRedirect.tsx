import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PaymentsRedirect: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on user type
      if (user.type === 'student') {
        navigate('/wallet');
      } else if (user.type === 'company') {
        navigate('/company-wallet');
      }
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to payments...</p>
      </div>
    </div>
  );
};

export default PaymentsRedirect;
