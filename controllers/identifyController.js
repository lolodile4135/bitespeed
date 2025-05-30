const Contact = require('../models/contactModel');
const { Op } = require('sequelize');

exports.identify = async (req, res) => {
  const { email, phoneNumber } = req.body;
  if (!email && !phoneNumber) return res.status(400).json({ error: 'Email or phoneNumber required' });

  const existingContacts = await Contact.findAll({
    where: {
      [Op.or]: [{ email }, { phoneNumber }]
    },
    order: [['createdAt', 'ASC']]
  });

  let primaryContact;
  if (existingContacts.length === 0) {
    primaryContact = await Contact.create({ email, phoneNumber });
  } else {
    primaryContact = existingContacts.find(c => c.linkPrecedence === 'primary') || existingContacts[0];

    const isExactMatch = existingContacts.some(c => c.email === email && c.phoneNumber === phoneNumber);
    if (!isExactMatch) {
      await Contact.create({
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary'
      });
    }

    for (let contact of existingContacts) {
      if (contact.id !== primaryContact.id && contact.linkPrecedence === 'primary') {
        contact.linkPrecedence = 'secondary';
        contact.linkedId = primaryContact.id;
        await contact.save();
      }
    }
  }

  const allLinked = await Contact.findAll({
    where: {
      [Op.or]: [
        { id: primaryContact.id },
        { linkedId: primaryContact.id }
      ]
    },
    order: [['id', 'ASC']]
  });

  const emails = [...new Set(allLinked.map(c => c.email).filter(Boolean))];
  const phoneNumbers = [...new Set(allLinked.map(c => c.phoneNumber).filter(Boolean))];
  const secondaryIds = allLinked.filter(c => c.linkPrecedence === 'secondary').map(c => c.id);

  res.json({
    contact: {
      primaryContactId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds: secondaryIds
    }
  });
};
