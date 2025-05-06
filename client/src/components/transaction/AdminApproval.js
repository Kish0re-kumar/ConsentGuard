import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Button
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const AdminApproval = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingStatus, setProcessingStatus] = useState('pending');
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  const [approvalTimer, setApprovalTimer] = useState(10);

  // Steps in approval process
  const steps = [
    'Document Verification',
    'Legal Review',
    'Official Approval'
  ];

  useEffect(() => {
    // Fetch transaction on mount
    const fetchTransaction = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransaction(response.data);
        setLoading(false);
        startApprovalProcess();
      } catch (err) {
        setError('Failed to load transaction details');
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  // Simulate approval process with steps and timers
  const startApprovalProcess = () => {
    setProcessingStatus('processing');
    
    // Simulate document verification step
    setTimeout(() => {
      setActiveStep(1);
      
      // Simulate legal review step
      setTimeout(() => {
        setActiveStep(2);
        
        // Simulate final approval step
        setTimeout(() => {
          setProcessingStatus('approved');
          submitApproval();
        }, 3000);
      }, 3000);
    }, 3000);
    
    // Start countdown timer
    const timer = setInterval(() => {
      setApprovalTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Submit approval to backend
  const submitApproval = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/transactions/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Wait 2 seconds before redirecting to payment confirmation
      setTimeout(() => {
        navigate(`/transaction/${id}/payment`);
      }, 2000);
      
    } catch (err) {
      setError('Failed to record approval. Please try again.');
      setProcessingStatus('error');
    }
  };

  // Manual approval if automatic process fails
  const handleManualApproval = async () => {
    setProcessingStatus('processing');
    await submitApproval();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Government Approval
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Box sx={{ my: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {processingStatus === 'pending' && <HourglassEmptyIcon sx={{ fontSize: 60, color: 'warning.main' }} />}
          {processingStatus === 'processing' && <CircularProgress size={60} />}
          {processingStatus === 'approved' && <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main' }} />}
          {processingStatus === 'error' && <GavelIcon sx={{ fontSize: 60, color: 'error.main' }} />}
        </Box>
        
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          {processingStatus === 'pending' && 'Awaiting Government Approval'}
          {processingStatus === 'processing' && 'Processing Government Approval'}
          {processingStatus === 'approved' && 'Government Approval Granted!'}
          {processingStatus === 'error' && 'Approval Process Error'}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          {processingStatus === 'pending' && 'Your transaction is waiting for official government approval.'}
          {processingStatus === 'processing' && 'Your request is being processed by government officials...'}
          {processingStatus === 'approved' && 'Your transaction has been officially approved. Proceeding to payment confirmation.'}
          {processingStatus === 'error' && 'There was an error during the approval process. Please try again.'}
        </Typography>
        
        {processingStatus === 'processing' && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Estimated time remaining: {approvalTimer} seconds
          </Typography>
        )}
        
        {processingStatus === 'error' && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleManualApproval}
            sx={{ mt: 2 }}
          >
            Retry Approval
          </Button>
        )}
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Approval Process
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1">
            {activeStep === 0 && 'Verifying document authenticity and signatures...'}
            {activeStep === 1 && 'Conducting legal review of property documents...'}
            {activeStep === 2 && 'Processing final approval by government official...'}
            {activeStep === 3 && 'Approval complete! Proceeding to payment confirmation.'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminApproval;