import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(true);
  const [actualOrderId, setActualOrderId] = useState<string | null>(null);

  const transactionId = searchParams.get('order_id'); // This is actually transaction ID from Midtrans
  const status = searchParams.get('status_code');
  const transactionStatus = searchParams.get('transaction_status');

  // Get actual order ID from transaction ID
  useEffect(() => {
    const getOrderFromTransaction = async () => {
      if (!transactionId) {
        setLoading(false);
        return;
      }

      try {
        // Call backend to get order ID from transaction ID
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/transaction/${transactionId}`);
        if (response.ok) {
          const data = await response.json();
          setActualOrderId(data.data.orderID);
        } else {
          console.warn('Could not fetch order from transaction ID');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    getOrderFromTransaction();
  }, [transactionId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to order detail page
          const orderToNavigate = actualOrderId || transactionId;
          if (orderToNavigate) {
            navigate(`/order/${orderToNavigate}`);
          } else {
            navigate('/products');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, actualOrderId, transactionId]);

  const handleViewOrder = () => {
    const orderToNavigate = actualOrderId || transactionId;
    if (orderToNavigate) {
      navigate(`/order/${orderToNavigate}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {loading ? (
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Memverifikasi Pembayaran...
          </h1>
          <p className="text-gray-600">
            Tunggu sebentar, kami sedang memverifikasi status pembayaran Anda.
          </p>
        </div>
      ) : (
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pembayaran Berhasil!
            </h1>
            <p className="text-gray-600">
              Terima kasih, pembayaran Anda telah berhasil diproses.
            </p>
          </div>

          {(actualOrderId || transactionId) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-1">Order ID:</div>
              <div className="font-mono text-lg font-semibold text-gray-900">
                {actualOrderId || transactionId}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleViewOrder}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Lihat Detail Pesanan
            </button>

            <div className="text-sm text-gray-500">
              Anda akan diarahkan ke halaman detail pesanan dalam {countdown} detik
            </div>
          </div>

          {/* Debug info for development */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
              <div className="text-xs text-gray-600 mb-2">Debug Info:</div>
              <div className="text-xs font-mono">
                <div>Order ID: {actualOrderId || transactionId || 'N/A'}</div>
                <div>Status Code: {status || 'N/A'}</div>
                <div>Transaction Status: {transactionStatus || 'N/A'}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
