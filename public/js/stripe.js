import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51QSuWUDuHI9lwyv3UCS5WnJTos77QaKSKTqOv3j97NzvU579iHtfTa2DuZG8AJfO6U3dLrl2XyAIp9Td9UgRtNu600Wy2g29BL',
    );
    // 1) Get the session from the server to the client side from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // 2) Use the stripe object to create checkout form + charge the credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
