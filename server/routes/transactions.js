const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  updateConsentVerification,
  updateDocumentSigning,
  updateAdminApproval,
  updatePaymentConfirmation,
  finalizeTransaction,
  deleteTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middlewares/auth');

router.route('/')
  .get(protect, getTransactions)
  .post(protect, createTransaction);

router.route('/:id')
  .get(protect, getTransaction)
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction);

router.put('/:id/consent', protect, updateConsentVerification);
router.put('/:id/sign', protect, updateDocumentSigning);
router.put('/:id/approve', protect, updateAdminApproval);
router.put('/:id/confirm-payment', protect, updatePaymentConfirmation);
router.put('/:id/finalize', protect, finalizeTransaction);

module.exports = router;