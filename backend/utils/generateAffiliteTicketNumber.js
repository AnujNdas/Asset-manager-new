const generateAffiliateTicketNumber = () => {
  const timestamp = Date.now();

  const random =
    Math.floor(1000 + Math.random() * 9000);

  return `APT-${timestamp}-${random}`;
};

module.exports =
  generateAffiliateTicketNumber;