// src/services/bookingService.js
import api, { tokenManager } from "./api";

function authGuard() {
  if (!tokenManager.isAuthenticated())
    throw new Error("Please log in to perform this action.");
}

export const bookingService = {
  /* Get free slots for a charger (server must exclude already‑booked ones) */
  async getAvailableSlots(chargerId, date) {
    authGuard();
    const { data } = await api.get(
      `/bookings/available-slots/${chargerId}/${date}`
    );
    return data; // → ["09:30‑10:00", …]
  },

  async createBooking(payload) {
    authGuard();
    const { data } = await api.post("/bookings/create", payload);
    return data;
  },

  async verifyPayment(sessionId) {
    authGuard();
    const { data } = await api.post("/bookings/verify-payment", { sessionId });
    return data;
  },

  async getMyBookings(params = {}) {
    authGuard();
    const { data } = await api.get("/bookings/my-bookings", { params });
    return data;
  },

  async cancelBooking(id) {
    authGuard();
    const { data } = await api.patch(`/bookings/cancel/${id}`);
    return data;
  },

  async updateBookingStatus(id, status) {
    authGuard();
    const { data } = await api.patch(`/bookings/status/${id}`, { status });
    return data;
  },
};
