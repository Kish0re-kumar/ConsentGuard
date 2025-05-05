import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { transactionApi } from '../../services/api';
import AuthContext from '../../utils/AuthContext';

const TransactionEntry = () => {
  const { currentUser } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const initialValues = {
    sellerName: currentUser?.name || '',
    sellerId: '',
    buyerName: '',
    buyerId: '',
    propertyType: '',
    propertyDescription: '',
    propertyAddress: '',
    salePrice: '',
    advancePaid: '',
    paymentMode: '',
    agreementDate: new Date().toISOString().split('T')[0],
    ownershipConfirmed: false,
    noLegalDisputes: false,
    noEncumbrances: false
  };

  const validationSchema = Yup.object({
    sellerName: Yup.string().required('Seller name is required'),
    sellerId: Yup.string().required('Seller ID is required'),
    buyerName: Yup.string().required('Buyer name is required'),
    buyerId: Yup.string().required('Buyer ID is required'),
    propertyType: Yup.string().required('Property type is required'),
    propertyDescription: Yup.string().required('Property description is required'),
    propertyAddress: Yup.string().required('Property address is required'),
    salePrice: Yup.number()
      .required('Sale price is required')
      .positive('Sale price must be positive'),
    advancePaid: Yup.number()
      .min(0, 'Advance paid cannot be negative')
      .max(Yup.ref('salePrice'), 'Advance paid cannot exceed sale price'),
    paymentMode: Yup.string().required('Payment mode is required'),
    agreementDate: Yup.date().required('Agreement date is required'),
    ownershipConfirmed: Yup.boolean().oneOf([true], 'You must confirm ownership'),
    noLegalDisputes: Yup.boolean().oneOf([true], 'You must confirm no legal disputes'),
    noEncumbrances: Yup.boolean().oneOf([true], 'You must confirm no encumbrances')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Set status to consent-pending as next step
      const transactionData = {
        ...values,
        status: 'consent-pending'
      };
      
      const response = await transactionApi.createTransaction(transactionData);
      setLoading(false);
      
      // Navigate to consent verification page with transaction ID
      navigate(`/transaction/consent/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transaction');
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Property Transaction Details</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-6">
              {/* Seller Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-4">Seller Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700 mb-1">
                      Seller Full Name
                    </label>
                    <Field
                      type="text"
                      id="sellerName"
                      name="sellerName"
                      className={`w-full p-2 border rounded ${
                        errors.sellerName && touched.sellerName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="sellerName" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div>
                    <label htmlFor="sellerId" className="block text-sm font-medium text-gray-700 mb-1">
                      Seller ID Number (Aadhaar/PAN)
                    </label>
                    <Field
                      type="text"
                      id="sellerId"
                      name="sellerId"
                      className={`w-full p-2 border rounded ${
                        errors.sellerId && touched.sellerId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="sellerId" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>
              </div>

              {/* Buyer Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-4">Buyer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700 mb-1">
                      Buyer Full Name
                    </label>
                    <Field
                      type="text"
                      id="buyerName"
                      name="buyerName"
                      className={`w-full p-2 border rounded ${
                        errors.buyerName && touched.buyerName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="buyerName" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div>
                    <label htmlFor="buyerId" className="block text-sm font-medium text-gray-700 mb-1">
                      Buyer ID Number (Aadhaar/PAN)
                    </label>
                    <Field
                      type="text"
                      id="buyerId"
                      name="buyerId"
                      className={`w-full p-2 border rounded ${
                        errors.buyerId && touched.buyerId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="buyerId" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-4">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type
                    </label>
                    <Field
                      as="select"
                      id="propertyType"
                      name="propertyType"
                      className={`w-full p-2 border rounded ${
                        errors.propertyType && touched.propertyType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Property Type</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Shop">Shop</option>
                      <option value="Land">Land</option>
                      <option value="Office">Office</option>
                      <option value="House">House</option>
                      <option value="Other">Other</option>
                    </Field>
                    <ErrorMessage name="propertyType" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div>
                    <label htmlFor="propertyDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Property Description
                    </label>
                    <Field
                      type="text"
                      id="propertyDescription"
                      name="propertyDescription"
                      className={`w-full p-2 border rounded ${
                        errors.propertyDescription && touched.propertyDescription ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="propertyDescription" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Property Address
                    </label>
                    <Field
                      as="textarea"
                      id="propertyAddress"
                      name="propertyAddress"
                      rows="3"
                      className={`w-full p-2 border rounded ${
                        errors.propertyAddress && touched.propertyAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="propertyAddress" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-4">Financial Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Agreed Sale Price (INR)
                    </label>
                    <Field
                      type="number"
                      id="salePrice"
                      name="salePrice"
                      className={`w-full p-2 border rounded ${
                        errors.salePrice && touched.salePrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="salePrice" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div>
                    <label htmlFor="advancePaid" className="block text-sm font-medium text-gray-700 mb-1">
                      Advance Paid (INR)
                    </label>
                    <Field
                      type="number"
                      id="advancePaid"
                      name="advancePaid"
                      className={`w-full p-2 border rounded ${
                        errors.advancePaid && touched.advancePaid ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="advancePaid" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div>
                    <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Mode
                    </label>
                    <Field
                      as="select"
                      id="paymentMode"
                      name="paymentMode"
                      className={`w-full p-2 border rounded ${
                        errors.paymentMode && touched.paymentMode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Payment Mode</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                      <option value="Other">Other</option>
                    </Field>
                    <ErrorMessage name="paymentMode" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-4">Important Dates</h3>
                <div>
                  <label htmlFor="agreementDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Agreement Date
                  </label>
                  <Field
                    type="date"
                    id="agreementDate"
                    name="agreementDate"
                    className={`w-full p-2 border rounded ${
                      errors.agreementDate && touched.agreementDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <ErrorMessage name="agreementDate" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {/* Declarations */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-4">Declarations</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <Field
                        type="checkbox"
                        id="ownershipConfirmed"
                        name="ownershipConfirmed"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="ownershipConfirmed" className="font-medium text-gray-700">
                        I confirm that I have full ownership of the property
                      </label>
                      <ErrorMessage name="ownershipConfirmed" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <Field
                        type="checkbox"
                        id="noLegalDisputes"
                        name="noLegalDisputes"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="noLegalDisputes" className="font-medium text-gray-700">
                        I confirm that there are no active legal disputes on the property
                      </label>
                      <ErrorMessage name="noLegalDisputes" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <Field
                        type="checkbox"
                        id="noEncumbrances"
                        name="noEncumbrances"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="noEncumbrances" className="font-medium text-gray-700">
                        I confirm that the property is free from encumbrances
                      </label>
                      <ErrorMessage name="noEncumbrances" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  {loading ? 'Processing...' : 'Continue to Consent Verification'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default TransactionEntry;