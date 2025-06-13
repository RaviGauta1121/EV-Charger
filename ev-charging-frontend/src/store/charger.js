// src/stores/chargers.js - Updated to use "token" key
import { defineStore } from "pinia";
import { chargerService } from "../services/chargerservice";
import router from "../router";

export const useChargersStore = defineStore("chargers", {
  state: () => ({
    chargers: [],
    loading: false,
    error: null,
    filters: {
      status: "",
      type: "",
      power: "",
      search: "",
      location: "",
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 12,
    },
  }),

  getters: {
    filteredChargers: (state) => {
      let filtered = state.chargers;

      if (state.filters.search) {
        const searchTerm = state.filters.search.toLowerCase();
        filtered = filtered.filter(
          (charger) =>
            charger.name?.toLowerCase().includes(searchTerm) ||
            charger.location?.toLowerCase().includes(searchTerm)
        );
      }

      if (state.filters.status) {
        filtered = filtered.filter(
          (charger) =>
            charger.status?.toLowerCase() === state.filters.status.toLowerCase()
        );
      }

      if (state.filters.type) {
        filtered = filtered.filter(
          (charger) =>
            charger.type?.toLowerCase() === state.filters.type.toLowerCase()
        );
      }

      if (state.filters.power) {
        filtered = filtered.filter(
          (charger) => charger.power >= state.filters.power
        );
      }

      if (state.filters.location) {
        filtered = filtered.filter((charger) =>
          charger.location
            ?.toLowerCase()
            .includes(state.filters.location.toLowerCase())
        );
      }

      return filtered;
    },

    chargersByStatus: (state) => {
      return state.chargers.reduce((acc, charger) => {
        const status = charger.status?.toLowerCase() || "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
    },
  },

  actions: {
    // Helper method to handle auth errors
    handleAuthError() {
      console.log("Handling auth error - clearing token and redirecting");
      localStorage.removeItem("token"); // Changed from "authToken" to "token"
      localStorage.removeItem("user");
      router.push("/login");
    },

    async fetchChargers(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        console.log("🔄 Fetching chargers...");
        const response = await chargerService.getChargers(params);

        if (response.data && Array.isArray(response.data)) {
          this.chargers = response.data;
          this.pagination.totalItems = response.total || response.data.length;
          this.pagination.totalPages =
            response.totalPages ||
            Math.ceil(
              this.pagination.totalItems / this.pagination.itemsPerPage
            );
        } else if (Array.isArray(response)) {
          this.chargers = response;
          this.pagination.totalItems = response.length;
          this.pagination.totalPages = Math.ceil(
            this.pagination.totalItems / this.pagination.itemsPerPage
          );
        } else {
          this.chargers = [];
        }
      } catch (error) {
        console.error("Error in fetchChargers:", error);

        if (
          error.response?.status === 401 ||
          error.status === 401 ||
          error.message?.includes("401") ||
          error.message?.includes("Unauthorized")
        ) {
          this.error = "Authentication required. Please log in.";
          this.handleAuthError();
        } else {
          this.error = error.message || "Failed to fetch chargers";
        }
      } finally {
        this.loading = false;
      }
    },

    async createCharger(chargerData) {
      try {
        console.log("🔄 Creating charger...");
        const response = await chargerService.createCharger(chargerData);

        if (response.data) {
          this.chargers.unshift(response.data);
        } else {
          this.chargers.unshift(response);
        }

        return response;
      } catch (error) {
        console.error("Error creating charger:", error);
        if (error.response?.status === 401 || error.status === 401) {
          this.error = "Authentication required. Please log in.";
          this.handleAuthError();
        } else {
          this.error = "Failed to create charger";
        }
        throw error;
      }
    },

    async updateCharger(id, chargerData) {
      try {
        const response = await chargerService.updateCharger(id, chargerData);

        const index = this.chargers.findIndex(
          (c) => c._id === id || c.id === id
        );
        if (index !== -1) {
          this.chargers[index] = response.data || response;
        }

        return response;
      } catch (error) {
        if (error.response?.status === 401 || error.status === 401) {
          this.error = "Authentication required. Please log in.";
          this.handleAuthError();
        } else {
          this.error = "Failed to update charger";
        }
        throw error;
      }
    },

    async deleteCharger(id) {
      try {
        await chargerService.deleteCharger(id);
        this.chargers = this.chargers.filter(
          (c) => c._id !== id && c.id !== id
        );
        return true;
      } catch (error) {
        if (error.response?.status === 401 || error.status === 401) {
          this.error = "Authentication required. Please log in.";
          this.handleAuthError();
        } else {
          this.error = "Failed to delete charger";
        }
        throw error;
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
      this.pagination.currentPage = 1;
    },

    clearFilters() {
      this.filters = {
        status: "",
        type: "",
        power: "",
        search: "",
        location: "",
      };
      this.pagination.currentPage = 1;
    },

    setPage(page) {
      this.pagination.currentPage = page;
    },

    clearError() {
      this.error = null;
    },
  },
});
