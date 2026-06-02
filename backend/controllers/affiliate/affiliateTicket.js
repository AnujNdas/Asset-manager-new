const crypto = require("crypto");

const AffiliateProfile = require("../../models/AffiliateProfile");
const AffiliateTicket = require("../../models/AffiliateTicket");

const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");

const createAffiliateTicket =
  asyncHandler(async (req, res) => {

    const userId = req.user.id;

    const affiliate =
      await AffiliateProfile.findOne({
        userId,
      });

    if (!affiliate) {
      throw new AppError(
        "Affiliate profile not found",
        404
      );
    }

    const {
      subject,
      category,
      priority,
      description,
    } = req.body;

    const ticket =
      await AffiliateTicket.create({
        affiliateId: affiliate._id,

        ticketNumber:
          "TKT-" +
          crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase(),

        subject,
        category,
        priority,
        description,
      });

    res.status(201).json({
      success: true,
      data: ticket,
    });
  });
const getAffiliateTickets =
  asyncHandler(async (req, res) => {

    const userId = req.user.id;

    const affiliate =
      await AffiliateProfile.findOne({
        userId,
      });

    const tickets =
      await AffiliateTicket.find({
        affiliateId: affiliate._id,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  });
  const getAffiliateTicketById =
  asyncHandler(async (req, res) => {

    const ticket =
      await AffiliateTicket.findById(
        req.params.id
      ).lean();

    if (!ticket) {
      throw new AppError(
        "Ticket not found",
        404
      );
    }

    res.json({
      success: true,
      data: ticket,
    });
  });
module.exports =  { createAffiliateTicket, getAffiliateTickets, getAffiliateTicketById };