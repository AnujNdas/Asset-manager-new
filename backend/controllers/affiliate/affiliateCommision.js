const AffiliateCommissionPayment = require(
  "../../models/AffiliateCommissionPayment"
);

const AffiliateProfile =
  require("../../models/AffiliateProfile");


const AffiliatePaymentTicket =
  require("../../models/AffiliatePaymentTicket");


  const generateAffiliateTicketNumber =
  require("../../utils/generateAffiliateTicketNumber");

const getAffiliateCommissionPayments = async (req, res) => {
  try {

    const payments =
      await AffiliateCommissionPayment.find({
        status: {
          $in: ["pending", "approved"],
        },
      })

        /* ==========================================
           AFFILIATE
        ========================================== */

        .populate(
          "affiliateId",
          "fullName email affiliateCode payoutMethod payoutDetails"
        )

        /* ==========================================
           ORGANIZATION
        ========================================== */

        .populate(
          "organizationId",
          "name orgCode"
        )

        /* ==========================================
           REFERRED USER
        ========================================== */

        .populate(
          "referredUserId",
          "fullName username email"
        )

        /* ==========================================
           ORIGINAL REFERRAL
        ========================================== */

        .populate(
          "referralId",
          "affiliateCode planName billingCycle paymentAmount paymentCurrency commissionRate commissionAmount convertedAt"
        )

        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });

  } catch (error) {

    console.error(
      "Get affiliate commission payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch affiliate commission payments",
    });
  }
};

const getAffiliatePaymentCommissions =
  async (req, res) => {
    try {

      const profile =
        await AffiliateProfile.findOne({
          userId: req.user.id,
        });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message:
            "Affiliate profile not found",
        });
      }

      const commissions =
        await AffiliateCommissionPayment.find({
          affiliateId: profile._id,

          status: {
            $in: [
              "pending",
              "approved",
            ],
          },
        })
          .populate(
            "organizationId",
            "name orgCode"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count: commissions.length,
        data: commissions,
      });

    } catch (error) {

      console.error(
        "Get affiliate payment commissions error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch commission payments",
      });
    }
  };

const createAffiliatePaymentTicket =
  async (req, res) => {
    try {

      const {
        commissionIds,
        message = "",
      } = req.body;

      if (
        !Array.isArray(commissionIds) ||
        commissionIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select at least one commission",
        });
      }

      /* ==========================================
         FIND AFFILIATE
      ========================================== */

      const profile =
        await AffiliateProfile.findOne({
          userId: req.user.id,
        });

      if (!profile) {
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
        await AffiliateCommissionPayment.find({
          _id: {
            $in: commissionIds,
          },

          affiliateId:
            profile._id,

          status: {
            $in: [
              "pending",
              "approved",
            ],
          },
        });

      if (
        commissions.length !==
        commissionIds.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more selected commissions are invalid or already processed",
        });
      }

      /* ==========================================
         CHECK EXISTING ACTIVE TICKETS
      ========================================== */

      const existingTicket =
        await AffiliatePaymentTicket.findOne({
          affiliateId:
            profile._id,

          commissionIds: {
            $in: commissionIds,
          },

          status: {
            $in: [
              "pending",
              "processing",
            ],
          },
        });

      if (existingTicket) {
        return res.status(400).json({
          success: false,
          message:
            "One or more selected commissions are already included in an active payment ticket",
        });
      }

      /* ==========================================
         CALCULATE TOTAL
      ========================================== */

      const totalAmount =
        commissions.reduce(
          (total, commission) =>
            total +
            Number(
              commission.commissionAmount || 0
            ),
          0
        );

      if (totalAmount <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Commission amount must be greater than zero",
        });
      }

      /* ==========================================
         PAYOUT DETAILS
      ========================================== */

      const payoutDetails =
        profile.payoutDetails || {};

      const payoutMethod =
        profile.payoutMethod;

      if (!payoutMethod) {
        return res.status(400).json({
          success: false,
          message:
            "Please configure your payout method first",
        });
      }

      /* ==========================================
         CREATE TICKET
      ========================================== */

      const ticket =
        await AffiliatePaymentTicket.create({

          ticketNumber:
            generateAffiliateTicketNumber(),

          affiliateId:
            profile._id,

          affiliateCode:
            profile.affiliateCode,

          commissionIds:
            commissions.map(
              (commission) =>
                commission._id
            ),

          totalAmount:
            Number(
              totalAmount.toFixed(2)
            ),

          currency:
            commissions[0]
              .paymentCurrency ||
            "USD",

          payoutMethod,

          payoutDetails: {
            upiId:
              payoutDetails.upiId || "",

            accountName:
              payoutDetails.accountName ||
              "",

            accountNumber:
              payoutDetails.accountNumber ||
              "",

            ifscCode:
              payoutDetails.ifscCode ||
              "",

            paypalEmail:
              payoutDetails.paypalEmail ||
              "",
          },

          message,

          status:
            "pending",
        });

      return res.status(201).json({
        success: true,
        message:
          "Payment ticket raised successfully",
        data: ticket,
      });

    } catch (error) {

      console.error(
        "Create affiliate payment ticket error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to create payment ticket",
      });
    }
  };

  const getAffiliatePaymentTickets =
  async (req, res) => {
    try {

      const profile =
        await AffiliateProfile.findOne({
          userId: req.user.id,
        });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message:
            "Affiliate profile not found",
        });
      }

      const tickets =
        await AffiliatePaymentTicket.find({
          affiliateId:
            profile._id,
        })
          .populate(
            "commissionIds",
            "planName billingCycle paymentAmount paymentCurrency commissionRate commissionAmount commissionType status createdAt"
          )
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
        "Get affiliate payment tickets error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch payment tickets",
      });
    }
  };

module.exports = {
  getAffiliateCommissionPayments,
    getAffiliatePaymentCommissions,
  createAffiliatePaymentTicket,
  getAffiliatePaymentTickets,
};