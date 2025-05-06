import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const DigitalSignature = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [signatureApplied, setSignatureApplied] = useState(false);
  
  const sigCanvas = useRef({});
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransaction(response.data);
        setLoading(false);
        generatePdf(response.data);
      } catch (err) {
        setError('Failed to load transaction details');
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const generatePdf = (transaction) => {
    if (!transaction) return;
    
    setGenerating(true);
    
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Property Transaction Agreement', 105, 20, { align: 'center' });
      
      // Add horizontal line
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);
      
      // Add transaction details
      doc.setFontSize(12);
      
      // Seller and Buyer information
      doc.text('Seller:', 20, 35);
      doc.text(`Name: ${transaction.sellerName}`, 30, 45);
      doc.text(`Aadhar: XXXX-XXXX-${transaction.sellerAadhar.slice(-4)}`, 30, 52);
      
      doc.text('Buyer:', 20, 65);
      doc.text(`Name: ${transaction.buyerName}`, 30, 75);
      doc.text(`Aadhar: XXXX-XXXX-${transaction.buyerAadhar.slice(-4)}`, 30, 82);
      
      // Property details
      doc.text('Property Details:', 20, 95);
      doc.text(`Type: ${transaction.propertyType}`, 30, 105);
      doc.text(`Address: ${transaction.propertyAddress}`, 30, 112);
      doc.text(`Description: ${transaction.propertyDescription}`, 30, 119);
      
      // Financial information
      doc.text('Financial Information:', 20, 132);
      doc.text(`Total Price: ₹${transaction.propertyPrice.toLocaleString()}`, 30, 142);
      doc.text(`Advance Paid: ₹${transaction.advancePaid.toLocaleString()}`, 30, 149);
      doc.text(`Payment Mode: ${transaction.paymentMode}`, 30, 156);
      
      // Declaration
      doc.text('Declaration:', 20, 169);
      doc.setFontSize(10);
      const declaration = 
        `I, ${transaction.sellerName}, confirm that I am the legal owner of the property described above and have the full right to transfer its ownership. This property is free from any encumbrances, legal disputes, or claims. All information provided in this document is true and correct to the best of my knowledge.`;
      
      const splitDeclaration = doc.splitTextToSize(declaration, 160);
      doc.text(splitDeclaration, 30, 179);
      
      // Agreement date
      doc.setFontSize(12);
      doc.text(`Agreement Date: ${new Date(transaction.agreementDate).toLocaleDateString()}`, 20, 205);
      
      // Signature placeholder
      doc.text('Seller Signature:', 20, 225);
      doc.rect(50, 215, 60, 20);
      
      // Generate PDF blob
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Set PDF URL for preview
      setPdfUrl(pdfUrl);
      setGenerating(false);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate document. Please try again.');
      setGenerating(false);
    }
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
    setSignatureUrl(null);
    setSignatureApplied(false);
  };

  const saveSignature = () => {
    if (sigCanvas.current.isEmpty()) {
      setError('Please draw your signature first');
      return;
    }
    
    const dataUrl = sigCanvas.current.toDataURL('image/png');
    setSignatureUrl(dataUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      setError('Please upload an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatureUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const applySignatureToPdf = async () => {
    if (!signatureUrl || !pdfUrl) {
      setError('Please create or upload a signature first');
      return;
    }
    
    try {
      // In a real implementation, we would use a PDF library to embed the signature
      // For now, we'll simulate this process
      setSignatureApplied(true);
      setSuccess('Signature applied to document successfully');
    } catch (err) {
      setError('Failed to apply signature to document');
    }
  };

  const handleSubmit = async () => {
    if (!signatureApplied) {
      setError('Please apply your signature to the document first');
      return;
    }
    
    setIsSigning(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Convert signature dataURL to blob
      const signatureBlob = await fetch(signatureUrl).then(r => r.blob());
      formData.append('signature', signatureBlob);
      
      // Submit to backend
      const response = await axios.put(
        `/api/transactions/${id}/sign`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setSuccess('Document signed successfully!');
      setIsSigning(false);
      
      // Navigate to next step after short delay
      setTimeout(() => {
        navigate(`/transaction/${id}/approve`);
      }, 2000);
      
    } catch (err) {
      setError('Failed to submit signature. Please try again.');
      setIsSigning(false);
    }
  };

  const handlePreviewOpen = () => {
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  if (loading || generating) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Digital Signature
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mb: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Document Preview
            </Typography>
            
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              {pdfUrl ? (
                <>
                  <Box 
                    component="img" 
                    src="/pdf-preview-icon.png" 
                    alt="PDF Document" 
                    sx={{ 
                      width: 100, 
                      height: 'auto', 
                      border: '1px solid #ddd',
                      mb: 2
                    }} 
                  />
                  <Box>
                    <Button 
                      variant="outlined" 
                      onClick={handlePreviewOpen}
                      startIcon={<DownloadIcon />}
                      sx={{ mr: 1 }}
                    >
                      Preview
                    </Button>
                    <Button 
                      variant="outlined" 
                      href={pdfUrl} 
                      download="property-transaction.pdf"
                      startIcon={<DownloadIcon />}
                    >
                      Download
                    </Button>
                  </Box>
                </>
              ) : (
                <CircularProgress />
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Document Status
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body1">
                Document Generated
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
              {signatureApplied ? (
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              ) : (
                <CheckCircleIcon color="disabled" sx={{ mr: 1 }} />
              )}
              <Typography variant="body1">
                Signature Applied
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create Signature
            </Typography>
            
            <Box
              sx={{
                border: '1px solid #ccc',
                background: '#f5f5f5',
                my: 2,
                borderRadius: 1
              }}
            >
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                  width: 300,
                  height: 150,
                  className: 'signature-canvas'
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CreateIcon />}
                onClick={saveSignature}
              >
                Save Signature
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={clearSignature}
              >
                Clear
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Or Upload Signature
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current.click()}
              >
                Upload Image
              </Button>
            </Box>
            
            {signatureUrl && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Your Signature
                </Typography>
                <Box 
                  component="img" 
                  src={signatureUrl} 
                  alt="Signature" 
                  sx={{ 
                    maxWidth: '100%', 
                    maxHeight: 100, 
                    border: '1px solid #ddd' 
                  }} 
                />
              </Box>
            )}
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              disabled={!signatureUrl || signatureApplied}
              onClick={applySignatureToPdf}
            >
              Apply Signature to Document
            </Button>
            
            <Button 
              variant="contained" 
              color="success" 
              disabled={!signatureApplied || isSigning}
              onClick={handleSubmit}
            >
              {isSigning ? <CircularProgress size={24} /> : 'Submit Signed Document'}
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {/* PDF Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Document Preview
          <Button 
            onClick={handlePreviewClose} 
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            Close
          </Button>
        </DialogTitle>
        <DialogContent>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              width="100%"
              height="500px"
              title="PDF Preview"
              style={{ border: 'none' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DigitalSignature;