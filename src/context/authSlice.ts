import { createSlice } from "@reduxjs/toolkit"
import { api } from "../services/api"
import type { User } from "../types"

export type AuthState = { token: string | null; user: User | null }

const empty: AuthState = { token: null, user: null }

function loadAuth(): AuthState {
  try {
    const raw = localStorage.getItem("hd_auth")
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (typeof parsed === "object" && parsed !== null && "token" in parsed && "user" in parsed) {
      return parsed as AuthState
    }
  } catch {
    // broken saved data: start logged out
  }
  return empty
}

const authSlice = createSlice({
  name: "auth",
  initialState: loadAuth(),
  reducers: {
    logout: () => empty,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(api.endpoints.login.matchFulfilled, (_state, { payload }) => payload)
      .addMatcher(api.endpoints.register.matchFulfilled, (_state, { payload }) => payload)
      .addMatcher(api.endpoints.me.matchFulfilled, (state, { payload }) => {
        state.user = payload
      })
  },
})
export const { logout } = authSlice.actions
export default authSlice.reducer