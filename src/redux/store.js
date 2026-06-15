import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    // поки можна пусто або заглушку
    auth: (state = {}) => state,
  },
});
