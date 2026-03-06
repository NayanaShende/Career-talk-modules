const db = require("../models");
const WalletTransaction = db.WalletTransaction;

const holdAmount = async (userId, amount, refId) => {
  return WalletTransaction.create({
    user_id: userId,
    type: "hold",
    amount,
    ref_id: refId,
  });
};

const debitAmount = async (userId, amount, refId) => {
  return WalletTransaction.create({
    user_id: userId,
    type: "debit",
    amount,
    ref_id: refId,
  });
};

const releaseAmount = async (userId, amount, refId) => {
  return WalletTransaction.create({
    user_id: userId,
    type: "release",
    amount,
    ref_id: refId,
  });
};

const topupAmount = async (userId, amount, refId) => {
  return WalletTransaction.create({
    user_id: userId,
    type: "topup",
    amount,
    ref_id: refId,
  });
};

module.exports = {
  holdAmount,
  debitAmount,
  releaseAmount,
  topupAmount,
};
