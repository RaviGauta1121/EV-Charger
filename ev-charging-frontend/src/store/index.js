import { defineStore } from "pinia";
import api from "../services/api";
import { authService } from "../services/auth";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: authService.getCurrentUser() ?? null,
    isAuthenticated: authService.isAuthenticated() ?? false,
  }),

  // Uncomment if using persisted state
  // persist: true,

  actions: {
    async login(credentials) {
      try {
        const data = await authService.login(credentials);
        this.user = data.user;
        this.isAuthenticated = true;
        return data;
      } catch (error) {
        console.error("Login failed:", error);
        throw new Error(error?.response?.data?.message || "Login failed");
      }
    },

    async register(userData) {
      try {
        const data = await authService.register(userData);
        this.user = data.user;
        this.isAuthenticated = true;
        return data;
      } catch (error) {
        console.error("Registration failed:", error);
        throw new Error(
          error?.response?.data?.message || "Registration failed"
        );
      }
    },

    logout() {
      authService.logout();
      this.user = null;
      this.isAuthenticated = false;
    },
  },
});

export const useChargerStore = defineStore("charger", {
  state: () => ({
    chargers: [],
    loading: false,
    filters: {
      status: "",
      type: "",
      power: "",
    },
  }),

  getters: {
    filteredChargers: (state) => {
      return state.chargers.filter(({ status, type, power }) => {
        const { status: fs, type: ft, power: fp } = state.filters;
        return (
          (!fs || status === fs) &&
          (!ft || type === ft) &&
          (!fp || +power >= +fp)
        );
      });
    },
  },

  actions: {
    async fetchChargers() {
      this.loading = true;
      try {
        const response = await api.get("/chargers");
        this.chargers = response.data;
      } catch (error) {
        console.error("Failed to fetch chargers:", error);
        throw new Error(error?.response?.data?.message || "Fetch failed");
      } finally {
        this.loading = false;
      }
    },
    async createCharger(chargerData) {
      try {
        const response = await api.post("/chargers", chargerData);
        this.chargers.push(response.data);
        return response.data;
      } catch (error) {
        console.error("Failed to create charger:", error);
        throw new Error(error?.response?.data?.message || "Create failed");
      }
    },

    async updateCharger(id, chargerData) {
      try {
        const response = await api.put(`/chargers/${id}`, chargerData);
        const index = this.chargers.findIndex((c) => c._id === id);
        if (index !== -1) {
          this.chargers[index] = response.data;
        } else {
          console.warn(`Charger with id ${id} not found.`);
        }
        return response.data;
      } catch (error) {
        console.error("Failed to update charger:", error);
        throw new Error(error?.response?.data?.message || "Update failed");
      }
    },

    async deleteCharger(id) {
      try {
        await api.delete(`/chargers/${id}`);
        this.chargers = this.chargers.filter((c) => c._id !== id);
      } catch (error) {
        console.error("Failed to delete charger:", error);
        throw new Error(error?.response?.data?.message || "Delete failed");
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
    },

    resetFilters() {
      this.filters = {
        status: "",
        type: "",
        power: "",
      };
    },
  },
});
