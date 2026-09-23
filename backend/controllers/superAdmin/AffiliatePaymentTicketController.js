const mongoose = require("mongoose");

const AffiliatePaymentTicket = require(
  "../../models/AffiliatePaymentTicket"
);

const AffiliateCommissionPayment = require(
  "../../models/AffiliateCommissionPayment"
);

const AffiliateProfile = require(
  "../../models/AffiliateProfile"
);

const getAffiliatePaymentTicketsForAdmin =
  async (req, res) => {
    try {

      const tickets =
        await AffiliatePaymentTicket.find({})
          .populate(
            "affiliateId",
            "fullName email affiliateCode payoutMethod payoutDetails"
          )
          .populate(
            "processedBy",
            "fullName username email"
          )
          .populate({
            path: "commissionIds",
            select:
              "affiliateCode organizationId referredUserId subscriptionId planName billingCycle paymentAmount paymentCurrency commissionRate commissionAmount commissionType status razorpayPaymentId createdAt",
            populate: [
              {
                path: "organizationId",
                select: "name orgCode",
              },
              {
                path: "referredUserId",
                select: "fullName username email",
              },
            ],
          })
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets,
      });

    } catch (error) {

      console.error(
        "Get affiliate payment tickets admin error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch affiliate payment tickets",
      });
    }
  };

  const getAffiliatePaymentTicketById =
  async (req, res) => {
    try {

      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket ID",
        });
      }

      const ticket =
        await AffiliatePaymentTicket.findById(id)
          .populate(
            "affiliateId",
            "fullName email affiliateCode phone payoutMethod payoutDetails"
          )
          .populate(
            "processedBy",
            "fullName username email"
          )
          .populate({
            path: "commissionIds",
            select:
              "affiliateCode organizationId referredUserId subscriptionId planName billingCycle paymentAmount paymentCurrency commissionRate commissionAmount commissionType status razorpayPaymentId createdAt",
            populate: [
              {
                path: "organizationId",
                select: "name orgCode",
              },
              {
                path: "referredUserId",
                select: "fullName username email",
              },
            ],
          });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Payment ticket not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: ticket,
      });

    } catch (error) {

      console.error(
        "Get affiliate payment ticket error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch payment ticket",
      });
    }
  };

  const processAffiliatePaymentTicket =
  async (req, res) => {
    try {

      const { id } = req.params;

      const ticket =
        await AffiliatePaymentTicket.findById(id);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Payment ticket not found",
        });
      }

      if (
        !["pending"].includes(ticket.status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Ticket cannot be processed from ${ticket.status} status`,
        });
      }

      ticket.status = "processing";

      ticket.processedBy =
        req.user.id;

      await ticket.save();

      return res.status(200).json({
        success: true,
        message:
          "Payment ticket moved to processing",
        data: ticket,
      });

    } catch (error) {

      console.error(
        "Process affiliate payment ticket error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to process payment ticket",
      });
    }
  };

  const resolveAffiliatePaymentTicket =
  async (req, res) => {

    const session =
      await mongoose.startSession();

    try {

      const {
        transactionId = "",
        adminNotes = "",
        paymentProof = {},
      } = req.body;

      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket ID",
        });
      }

      session.startTransaction();

      /* ==========================================
         FIND TICKET
      ========================================== */

      const ticket =
        await AffiliatePaymentTicket
          .findById(id)
          .session(session);

      if (!ticket) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message:
            "Payment ticket not found",
        });
      }

      /* ==========================================
         STATUS CHECK
      ========================================== */

      if (
        ["paid", "resolved"].includes(
          ticket.status
        )
      ) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "This payment ticket has already been resolved",
        });
      }

      if (
        ticket.status === "rejected"
      ) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Rejected tickets cannot be resolved",
        });
      }

      /* ==========================================
         TRANSACTION ID
      ========================================== */

      if (!transactionId.trim()) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Transaction ID is required",
        });
      }

      /* ==========================================
         FIND AFFILIATE
      ========================================== */

      const affiliate =
        await AffiliateProfile
          .findById(ticket.affiliateId)
          .session(session);

      if (!affiliate) {

        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message:
            "Affiliate profile not found",
        });
      }

      /* ==========================================
         FIND COMMISSIONS
      ========================================== */

      const commissions =
        await AffiliateCommissionPayment
          .find({
            _id: {
              $in: ticket.commissionIds,
            },
            affiliateId:
              ticket.affiliateId,
          })
          .session(session);

      if (
        commissions.length !==
        ticket.commissionIds.length
      ) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "One or more commission records are missing",
        });
      }

      /* ==========================================
         CHECK COMMISSIONS
      ========================================== */

      const alreadyPaid =
        commissions.find(
          (commission) =>
            commission.status === "paid"
        );

      if (alreadyPaid) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "One or more commissions have already been paid",
        });
      }

      /* ==========================================
         CALCULATE TOTAL
      ========================================== */

      const commissionTotal =
        commissions.reduce(
          (total, commission) =>
            total +
            Number(
              commission.commissionAmount || 0
            ),
          0
        );

      /* ==========================================
         VERIFY TOTAL
      ========================================== */

      if (
        Number(
          commissionTotal.toFixed(2)
        ) !==
        Number(
          ticket.totalAmount.toFixed(2)
        )
      ) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Ticket amount does not match commission total",
        });
      }

      /* ==========================================
         UPDATE COMMISSIONS
      ========================================== */

      for (
        const commission of commissions
      ) {

        commission.status = "paid";

        commission.payoutMethod =
          ticket.payoutMethod;

        commission.transactionId =
          transactionId.trim();

        commission.paidAt =
          new Date();

        commission.paymentProof = {
          url:
            paymentProof?.url || "",

          publicId:
            paymentProof?.publicId || "",

          uploadedAt:
            paymentProof?.url
              ? new Date()
              : null,
        };

        commission.processedBy =
          req.user.id;

        commission.adminNotes =
          adminNotes.trim();

        await commission.save({
          session,
        });
      }

      /* ==========================================
         UPDATE AFFILIATE EARNINGS
      ========================================== */

      const amountToMove =
        Number(
          commissionTotal.toFixed(2)
        );

      affiliate.pendingEarnings =
        Math.max(
          0,
          Number(
            affiliate.pendingEarnings || 0
          ) - amountToMove
        );

      affiliate.paidEarnings =
        Number(
          affiliate.paidEarnings || 0
        ) + amountToMove;

      affiliate.lastPayoutAt =
        new Date();

      await affiliate.save({
        session,
      });

      /* ==========================================
         UPDATE TICKET
      ========================================== */

      ticket.status = "resolved";

      ticket.processedBy =
        req.user.id;

      ticket.transactionId =
        transactionId.trim();

      ticket.adminNotes =
        adminNotes.trim();

      ticket.paymentProof = {
        url:
          paymentProof?.url || "",

        publicId:
          paymentProof?.publicId || "",

        uploadedAt:
          paymentProof?.url
            ? new Date()
            : null,
      };

      ticket.paidAt =
        new Date();

      ticket.resolvedAt =
        new Date();

      await ticket.save({
        session,
      });

      await session.commitTransaction();

      return res.status(200).json({
        success: true,
        message:
          "Affiliate payment processed and ticket resolved successfully",
        data: ticket,
      });

    } catch (error) {

      await session.abortTransaction();

      console.error(
        "Resolve affiliate payment ticket error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to resolve affiliate payment ticket",
      });

    } finally {

      session.endSession();

    }
  };

  const rejectAffiliatePaymentTicket =
  async (req, res) => {
    try {

      const {
        adminNotes = "",
      } = req.body;

      const { id } = req.params;

      const ticket =
        await AffiliatePaymentTicket.findById(id);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message:
            "Payment ticket not found",
        });
      }

      if (
        ["paid", "resolved"].includes(
          ticket.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A completed ticket cannot be rejected",
        });
      }

      ticket.status = "rejected";

      ticket.processedBy =
        req.user.id;

      ticket.adminNotes =
        adminNotes.trim();

      await ticket.save();

      return res.status(200).json({
        success: true,
        message:
          "Payment ticket rejected",
        data: ticket,
      });

    } catch (error) {

      console.error(
        "Reject affiliate payment ticket error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to reject payment ticket",
      });
    }
  };


  module.exports = {
  getAffiliatePaymentTicketsForAdmin,
  getAffiliatePaymentTicketById,
  processAffiliatePaymentTicket,
  resolveAffiliatePaymentTicket,
  rejectAffiliatePaymentTicket,
};