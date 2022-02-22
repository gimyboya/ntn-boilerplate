// this function is called before the user is redirected back from the Stripe checkout page to generate a session
require('dotenv').config()
const STRIPE_SK = process.env.STRIPE_SK
const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.BASE_URL : 'http://localhost:8888'
const STRIPE_GENERAL_PRODUCT = process.env.STRIPE_GENERAL_PRODUCT
const stripe = require('stripe')(STRIPE_SK),
  headers = {
    'Access-Control-Allow-Origin': BASE_URL,
    'Access-Control-Allow-Headers': 'Content-Type',
  }

exports.handler = async function (event, context) {
  // CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
    }
  }
  // your server-side functionality
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          unit_amount_decimal: event.queryStringParameters.amount,
          currency: 'usd',
          product: event.queryStringParameters.slug ? event.queryStringParameters.slug : STRIPE_GENERAL_PRODUCT,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${BASE_URL}${
      event.queryStringParameters.locale === 'en' ? '' : `/${event.queryStringParameters.locale}`
    }/success`,
    cancel_url: `${BASE_URL}/${
      event.queryStringParameters.locale === 'en' ? '' : `/${event.queryStringParameters.locale}`
    }/cancel`,
    locale: event.queryStringParameters.locale,
    // payment_method_types: ['card', 'fpx', 'grabpay', 'alipay'],
  })

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(session),
  }
  // redirect to the checkout session url
  // res.redirect(303, session.url)
}
