import { loadStripe } from "@stripe/stripe-js";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../core/services/firebase";
import { premiumApi } from "./api";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

export const createCheckoutSession = async (userId) => {
  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        priceId: "price_H5ggYwtDq4fbrJ", // Stripe'dan alınan fiyat ID'si
      }),
    });

    const session = await response.json();
    const stripe = await stripePromise;

    // Stripe Checkout sayfasına yönlendir
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Ödeme başlatma hatası:", error);
    throw error;
  }
};

export const upgradeToPremium = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      premium: true,
      premiumSince: new Date(),
    });
  } catch (error) {
    console.error("Premium üyelik güncelleme hatası:", error);
    throw error;
  }
};

export const PremiumService = {
  async upgradeToPremium(userId, subscriptionData) {
    try {
      const response = await premiumApi.upgrade(userId, subscriptionData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async cancelSubscription(userId) {
    try {
      await premiumApi.cancel(userId);
    } catch (error) {
      throw error;
    }
  },

  async getSubscriptionStatus(userId) {
    try {
      const response = await premiumApi.getStatus(userId);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateSubscription(userId, subscriptionData) {
    try {
      const response = await premiumApi.update(userId, subscriptionData);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
