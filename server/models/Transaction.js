const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  // Seller Information
  sellerName: {
    type: String,
    required: [true, 'Please add seller name']
  },
  sellerId: {
    type: String,
    required: [true, 'Please add seller ID number']
  },
  
  // Buyer Information
  buyerName: {
    type: String,
    required: [true, 'Please add buyer name']
  },
  buyerId: {
    type: String,
    required: [true, 'Please add buyer ID number']
  },
  
  // Property Details
  propertyType: {
    type: String,
    required: [true, 'Please add property type'],
    enum: ['Apartment', 'Shop', 'Land', 'Office', 'House', 'Other']
  },
  propertyDescription: {
    type: String,
    required: [true, 'Please add property description']
  },
  propertyAddress: {
    type: String,
    required: [true, 'Please add property address']
  },
  
  // Financial Details
  salePrice: {
    type: Number,
    required: [true, 'Please add agreed sale price']
  },
  advancePaid: {
    type: Number,
    default: 0
  },
  paymentMode: {
    type: String,
    required: [true, 'Please add payment mode'],
    enum: ['Bank Transfer', 'UPI', 'Cheque', 'Cash', 'Other']
  },
  
  // Important Dates
  agreementDate: {
    type: Date,
    required: [true, 'Please add agreement date'],
    default: Date.now
  },
  
  // Declarations
  ownershipConfirmed: {
    type: Boolean,
    default: false
  },
  noLegalDisputes: {
    type: Boolean,
    default: false
  },
  noEncumbrances: {
    type: Boolean,
    default: false
  },
  
  // Processing Status
  consentVerified: {
    type: Boolean,
    default: false
  },
  documentSigned: {
    type: Boolean,
    default: false
  },
  adminApproved: {
    type: Boolean,
    default: false
  },
  paymentConfirmed: {
    type: Boolean,
    default: false
  },
  
  // Blockchain & IPFS Data
  ipfsCid: {
    type: String,
    default: null
  },
  transactionHash: {
    type: String,
    default: null
  },
  
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'consent-pending', 'signature-pending', 'approval-pending', 'payment-pending', 'processing', 'completed', 'failed'],
    default: 'draft'
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);