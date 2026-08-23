const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
const prisma = new PrismaClient();

async function main() {
  const piId = 'pi_3U7kVMDZTpnku4Ct0MZJk5Sq';
  const pedidoId = 'cmt6f4pl40002i5v4o1cy34cw'; // As provided by user

  console.log(`Confirming PaymentIntent: ${piId}...`);

  try {
    const paymentIntent = await stripe.paymentIntents.confirm(piId, {
      payment_method: 'pm_card_visa'
    });

    console.log(`\n=== 1. PaymentIntent Status ===`);
    console.log(`Status: ${paymentIntent.status}`);
    console.log(`Amount: ${paymentIntent.amount} ${paymentIntent.currency}`);

    console.log(`\n=== 4. PaymentIntent Connect Details ===`);
    console.log(`On Behalf Of: ${paymentIntent.on_behalf_of}`);
    console.log(`Transfer Data Destination: ${paymentIntent.transfer_data?.destination}`);
    console.log(`Application Fee Amount: ${paymentIntent.application_fee_amount}`);

    // Wait for webhook to process
    console.log('\nWaiting 3 seconds for webhook processing...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log(`\n=== 3. Pago Status in DB ===`);
    const pagos = await prisma.pago.findMany({
      where: { stripePaymentId: piId }
    });
    
    if (pagos.length === 0) {
      console.log('❌ No Pago found for this PaymentIntent in DB.');
    } else {
      pagos.forEach(p => {
        console.log(`Pago ID: ${p.id}`);
        console.log(`Estado: ${p.estado}`);
        console.log(`Pedido ID: ${p.pedidoId}`);
        console.log(`Monto: ${p.monto}`);
      });
    }

  } catch (err) {
    console.error('Error confirming PaymentIntent:', err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
