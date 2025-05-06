const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Transaction = require('../models/Transaction');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const os = require('os');

// Set up multer for storing uploaded signatures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(os.tmpdir(), 'signatures');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
}).single('signature');

// @desc      Upload signature and update transaction
// @route     PUT /api/transactions/:id/sign
// @access    Private
exports.uploadSignature = asyncHandler(async (req, res, next) => {
  const uploadHandler = (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return next(new ErrorResponse(`Multer error: ${err.message}`, 400));
      } else if (err) {
        return next(new ErrorResponse(`Signature upload error: ${err.message}`, 400));
      }
      // Everything went fine, proceed
      processSignature(req, res, next);
    });
  };

  uploadHandler(req, res, next);
});

// Process and store the uploaded signature
const processSignature = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a signature image', 400));
  }

  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    // Remove the uploaded file if transaction not found
    fs.unlinkSync(req.file.path);
    return next(new ErrorResponse(`No transaction found with id ${req.params.id}`, 404));
  }

  // Check if user owns this transaction
  if (transaction.user.toString() !== req.user.id) {
    // Remove the uploaded file if unauthorized
    fs.unlinkSync(req.file.path);
    return next(new ErrorResponse('Not authorized to access this transaction', 401));
  }

  try {
    // Update transaction with signature details
    transaction.signatureDetails = {
      signatureProvided: true,
      timestamp: Date.now(),
      signaturePath: req.file.filename // Store just the filename, not the full path
    };
    
    // Update transaction status
    if (transaction.status === 'consent_verified') {
      transaction.status = 'document_signed';
    }
    
    await transaction.save();
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Signature uploaded successfully',
      transaction: {
        id: transaction._id,
        status: transaction.status
      }
    });
  } catch (error) {
    console.error('Signature processing error:', error);
    // Cleanup the file in case of error
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return next(new ErrorResponse('Error processing signature', 500));
  }
});