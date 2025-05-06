import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CircularProgress, Button, Typography, Box, Alert, Paper } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const ConsentVerification = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [consentStatement, setConsentStatement] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Fetch transaction details
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransaction(response.data);
        generateConsentStatement(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load transaction details');
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  // Generate consent statement from transaction details
  const generateConsentStatement = (transaction) => {
    if (!transaction) return;
    
    const statement = `I, ${transaction.sellerName}, with Aadhar number ending in XX${transaction.sellerAadhar.slice(-4)}, 
    hereby consent to sell my property located at ${transaction.propertyAddress} to 
    ${transaction.buyerName} for the agreed amount of ₹${transaction.propertyPrice.toLocaleString()}. 
    I confirm that I am the legal owner of this property and have the right to transfer ownership. 
    This transaction is being conducted with my full knowledge and consent, without any coercion or misrepresentation.`;
    
    setConsentStatement(statement);
  };

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      setError('Failed to access camera and microphone. Please ensure you have granted the necessary permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Verify consent using AI
  const verifyConsent = async () => {
    if (!recordedBlob) {
      setError('Please record a video first');
      return;
    }
    
    setVerifying(true);
    setVerificationProgress(0);
    
    try {
      // Create a FormData object to send the video
      const formData = new FormData();
      formData.append('video', recordedBlob);
      formData.append('transactionId', id);
      formData.append('consentStatement', consentStatement);
      
      const token = localStorage.getItem('token');
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setVerificationProgress(prev => {
          const newProgress = prev + 10;
          return newProgress <= 90 ? newProgress : prev;
        });
      }, 500);
      
      // Send to backend for verification
      const response = await axios.post(
        `/api/transactions/${id}/consent`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      clearInterval(progressInterval);
      setVerificationProgress(100);
      
      if (response.data.verified) {
        setVerified(true);
        setTimeout(() => {
          navigate(`/transaction/${id}/signature`);
        }, 2000);
      } else {
        setError('Consent verification failed. Please ensure you clearly read the entire consent statement.');
      }
    } catch (err) {
      setError('Failed to verify consent. Please try again.');
    } finally {
      setVerifying(false);
    }
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
        Video Consent Verification
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {verified && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Consent verified successfully! Redirecting to digital signature...
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Consent Statement:
        </Typography>
        <Typography variant="body1" paragraph sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
          {consentStatement}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Please read the above statement clearly and completely in your video.
        </Typography>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ position: 'relative' }}>
          <video 
            ref={videoRef} 
            autoPlay 
            muted={recording} 
            style={{ width: '100%', height: '400px', backgroundColor: '#000', borderRadius: '4px' }}
          />
          
          {recordedBlob && !recording && (
            <Box sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'background.paper', p: 1, borderRadius: '50%' }}>
              <CheckCircleIcon color="success" />
            </Box>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
          {!recording ? (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<VideocamIcon />}
              onClick={startRecording}
              disabled={verifying || verified}
            >
              Start Recording
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="error" 
              startIcon={<StopIcon />}
              onClick={stopRecording}
            >
              Stop Recording
            </Button>
          )}
          
          <Button 
            variant="contained" 
            color="success" 
            onClick={verifyConsent}
            disabled={!recordedBlob || recording || verifying || verified}
          >
            Verify Consent
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
            disabled={verifying || verified}
          >
            Back
          </Button>
        </Box>
        
        {verifying && (
          <Box sx={{ width: '100%', mt: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Verifying consent... {verificationProgress}%
            </Typography>
            <Box sx={{ width: '100%', bgcolor: '#e0e0e0', borderRadius: 1 }}>
              <Box 
                sx={{ 
                  width: `${verificationProgress}%`, 
                  bgcolor: 'primary.main', 
                  height: 10, 
                  borderRadius: 1,
                  transition: 'width 0.5s ease'
                }} 
              />
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ConsentVerification;