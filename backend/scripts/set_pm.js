require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = new PrismaClient();

async function main() {
  const NEGOCIO_ID = 'cmsgz900j0000lee1qecmhag5';
  
  // Find customer
  const negocio = await db.negocio.findUnique({ where: { id: NEGOCIO_ID } });
  
  if (negocio.stripeCustomerId) {
    // get payment methods for customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: negocio.stripeCustomerId,
      type: 'card',
    });
    
    if (paymentMethods.data.length > 0) {
      await db.negocio.update({
        where: { id: NEGOCIO_ID },
        data: { stripeMetodoPagoId: paymentMethods.data[0].id }
      });
      console.log('✅ stripeMetodoPagoId updated to:', paymentMethods.data[0].id);
    } else {
      console.log('❌ No payment methods found for customer.');
    }
  } else {
    console.log('❌ No stripeCustomerId found.');
  }

  await db.$disconnect();
}

main().catch(console.error);
