import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import AuthContext from '../../utils/AuthContext';

const Register = () => {
  const { register, verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [userData, setUserData] = useState(null);

  const initialValues = {
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    aadharNo: '',
    address: ''
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
      .required('Mobile number is required'),
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
    aadharNo: Yup.string()
      .matches(/^[0-9]{12}$/, 'Aadhar number must be 12 digits')
      .required('Aadhar number is required'),
    address: Yup.string().required('Address is required')
  });

  const otpValidationSchema = Yup.object({
    otp: Yup.string()
      .matches(/^[0-9]{6}$/, 'OTP must be 6 digits')
      .required('OTP is required')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userDataToSend } = values;
      setUserData(userDataToSend);
      
      // For mock OTP verification
      setShowOTPForm(true);
      toast.info('OTP sent to your mobile number. Use 123456 for testing.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleOTPSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      
      // First verify OTP
      await verifyOTP({
        mobile: userData.mobile,
        otp: values.otp
      });
      
      // Then register user
      await register(userData);
      
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 my-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
        {showOTPForm ? 'Verify OTP' : 'Register'}
      </h2>

      {showOTPForm ? (
        <Formik
          initialValues={{ otp: '' }}
          validationSchema={otpValidationSchema}
          onSubmit={handleOTPSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-6">
                <label htmlFor="otp" className="block text-gray-700 font-medium mb-2">
                  OTP
                </label>
                <Field
                  type="text"
                  id="otp"
                  name="otp"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 6-digit OTP"
                />
                <ErrorMessage name="otp" component="div" className="text-red-500 text-sm mt-1" />
                <p className="text-sm text-gray-500 mt-2">
                  For testing purposes, use OTP: 123456
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </Form>
          )}
        </Formik>
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Full Name
                </label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="mb-4">
                <label htmlFor="mobile" className="block text-gray-700 font-medium mb-2">
                  Mobile Number
                </label>
                <Field
                  type="text"
                  id="mobile"
                  name="mobile"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your 10-digit mobile number"
                />
                <ErrorMessage name="mobile" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="mb-4">
                <label htmlFor="aadharNo" className="block text-gray-700 font-medium mb-2">
                  Aadhar Number
                </label>
                <Field
                  type="text"
                  id="aadharNo"
                  name="aadharNo"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your 12-digit Aadhar number"
                />
                <ErrorMessage name="aadharNo" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                  Address
                </label>
                <Field
                  as="textarea"
                  id="address"
                  name="address"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your address"
                  rows="3"
                />
                <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                  Confirm Password
                </label>
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your password"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>
      )}

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;