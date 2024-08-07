import { useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { loadStripe } from "@stripe/stripe-js";
import { QUERY_CHECKOUT } from "../graphQL/queries.js";
import Auth from "./AuthService.js";

const stripePromise = loadStripe(
  "pk_test_51PjPMKL1ZM5VA6yhxuOzoced5WBEgYuBrn8JcXHyr4gMd4S7I754CEz9DJTPIh1WlHeNRCGDaREaIkF5XD2rSKkk00Q1mNm8Pm"
);

const useDonationButton = () => {
  const [getCheckout, { data: checkoutData, error: queryError }] =
    useLazyQuery(QUERY_CHECKOUT);
  const donationAmount = 10;

  const handleDonation = () => {
    if (!Auth.loggedIn()) {
      console.log("User not logged in");
      return;
    }

    console.log("Initiating checkout with donation amount:", donationAmount);

    getCheckout({
      variables: { donations: [], amount: donationAmount },
    }).catch((err) => {
      console.error("Error executing GraphQL query:", err);
    });
  };

  useEffect(() => {
    if (checkoutData) {
      stripePromise
        .then((stripe) => {
          if (stripe) {
            return stripe.redirectToCheckout({
              sessionId: checkoutData.checkout.session,
            });
          } else {
            console.error("Stripe instance not available");
          }
        })
        .catch((err) => {
          console.error("Stripe redirect error:", err);
        });
    } else if (queryError) {
      console.error("GraphQL Query Error:", queryError);
    }
  }, [checkoutData, queryError]);

  return handleDonation;
};

export default useDonationButton;
