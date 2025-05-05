import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { transactionApi } from '../services/api';
import AuthContext from '../utils/AuthContext';

const Home = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [transactionLoading, setTransactionLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch transactions if user is logged in
    if (currentUser && !loading) {
      fetchTransactions();
    }
  }, [currentUser, loading]);

  const fetchTransactions = async () => {
    try {
      setTransactionLoading(true);
      const response = await transactionApi.getTransactions();
      setTransactions(response.data.data);
      setTransactionLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
      setTransactionLoading(false);
    }
  };

  const handleMakeTransaction = () => {
    navigate('/transaction/create');
  };

  const handleVerifyTransaction = (id) => {
    navigate(`/transaction/verify/${id}`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-200 text-gray-800';
      case 'consent-pending':
        return 'bg-yellow-200 text-yellow-800';
      case 'signature-pending':
        return 'bg-orange-200 text-orange-800';
      case 'approval-pending':
        return 'bg-blue-200 text-blue-800';
      case 'payment-pending':
        return 'bg-purple-200 text-purple-800';
      case 'processing':
        return 'bg-indigo-200 text-indigo-800';
      case 'completed':
        return 'bg-green-200 text-green-800';
      case 'failed':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
        <p className="mb-4">You need to be logged in to view this page.</p>
        <div className="flex space-x-4">
          <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Login
          </Link>
          <Link to="/register" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">User Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-semibold">{currentUser.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-semibold">{currentUser.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Mobile</p>
            <p className="font-semibold">{currentUser.mobile}</p>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Transaction History</h2>
          <button
            onClick={handleMakeTransaction}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Make Transaction
          </button>
        </div>

        {transactionLoading ? (
          <div className="text-center py-4">Loading transactions...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-4">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-4">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Property</th>
                  <th className="py-2 px-4 border-b text-left">Buyer</th>
                  <th className="py-2 px-4 border-b text-left">Sale Price</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">IPFS CID</th>
                  <th className="py-2 px-4 border-b text-left">Transaction Hash</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      <div className="font-medium">{transaction.propertyDescription}</div>
                      <div className="text-sm text-gray-600">{transaction.propertyType}</div>
                    </td>
                    <td className="py-2 px-4 border-b">{transaction.buyerName}</td>
                    <td className="py-2 px-4 border-b">₹{transaction.salePrice.toLocaleString()}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(transaction.status)}`}>
                        {transaction.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {transaction.ipfsCid ? (
                        <span className="text-xs font-mono">{transaction.ipfsCid.substring(0, 10)}...</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {transaction.transactionHash ? (
                        <span className="text-xs font-mono">{transaction.transactionHash.substring(0, 10)}...</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <Link
                          to={`/transaction/${transaction._id}`}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          View
                        </Link>
                        {transaction.status !== 'draft' && (
                          <button
                            onClick={() => handleVerifyTransaction(transaction._id)}
                            className="text-green-500 hover:text-green-700"
                          >
                            Verify
                          </button>
                        )}
                        {transaction.status === 'draft' && (
                          <Link
                            to={`/transaction/edit/${transaction._id}`}
                            className="text-yellow-500 hover:text-yellow-700"
                          >
                            Continue
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;