const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Transaction = require('../models/Transaction');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const multer = require('multer');
const os = require('os');

// Set up multer for storing uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(os.tmpdir(), 'consent-videos');
    
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
    fileSize: 50 * 1024 * 1024 // Limit file size to 50MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
}).single('video');

// @desc      Upload and verify consent video
// @route     POST /api/transactions/:id/consent
// @access    Private
exports.verifyConsent = asyncHandler(async (req, res, next) => {
  const uploadHandler = (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return next(new ErrorResponse(`Multer error: ${err.message}`, 400));
      } else if (err) {
        return next(new ErrorResponse(`Video upload error: ${err.message}`, 400));
      }
      // Everything went fine, proceed
      processVideo(req, res, next);
    });
  };

  uploadHandler(req, res, next);
});

// Process and verify the uploaded video
const processVideo = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a video file', 400));
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
    // Path to the video file
    const videoPath = req.file.path;
    
    // For now, we'll mock the AI verification process
    // In a real implementation, we would call the Python script with the model
    
    // Mock verification (simulating AI processing)
    // In production, replace with actual model call
    const mockVerify = () => {
      return new Promise((resolve) => {
        // Simulate processing time
        setTimeout(() => {
          // Mock result - in production this would come from model
          const result = {
            verified: true,
            confidence: 0.92,
            match_score: 0.89
          };
          resolve(result);
        }, 3000); // 3 second delay to simulate processing
      });
    };

    // Call mock verification (or real verification in production)
    const verificationResult = await mockVerify();
    
    // Update transaction with verification result
    transaction.consentVerified = verificationResult.verified;
    transaction.consentVerificationDetails = {
      verified: verificationResult.verified,
      timestamp: Date.now(),
      confidence: verificationResult.confidence,
      matchScore: verificationResult.match_score,
      videoPath: req.file.filename // Store just the filename, not the full path
    };
    
    await transaction.save();

    // Return verification result
    res.status(200).json({
      success: true,
      verified: verificationResult.verified,
      transaction: {
        id: transaction._id,
        status: transaction.status,
        consentVerified: transaction.consentVerified
      }
    });
    
  } catch (error) {
    console.error('Verification error:', error);
    // Cleanup the file in case of error
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return next(new ErrorResponse('Error verifying consent video', 500));
  }
});

// @desc      For production: AI model verification function
// @note      This would call the actual Python model with the pickled file
const verifyWithAIModel = async (videoPath, consentStatement) => {
  return new Promise((resolve, reject) => {
    // Path to Python script
    const pythonScript = path.join(__dirname, '../scripts/verify_consent.py');
    
    // Path to the pickle model file
    const modelPath = path.join(__dirname, '../models/consent_verification_model.pkl');
    
    // Spawn Python process
    const pythonProcess = spawn('python', [
      pythonScript,
      '--video_path', videoPath,
      '--model_path', modelPath,
      '--consent_text', consentStatement
    ]);
    
    let result = '';
    let error = '';
    
    // Collect data from script
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    // Collect errors from script
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python process exited with code ${code}: ${error}`));
      }
      
      try {
        const parsedResult = JSON.parse(result);
        resolve(parsedResult);
      } catch (e) {
        reject(new Error(`Failed to parse Python script output: ${e.message}`));
      }
    });
  });
};