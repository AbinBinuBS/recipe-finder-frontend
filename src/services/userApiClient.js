import axios from "axios";
import { store } from "../redux/store";
import { setTokens, clearTokens } from "../redux/userSlice";

const userApiClient = axios.create({
	baseURL: "http://localhost:3001",
	headers: {
		"Content-Type": "application/json",
	},
});

userApiClient.interceptors.request.use(
	(config) => {
		const state = store.getState();
		const accessToken = state.accessToken;
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

userApiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response && error.response.status === 403) {
			const errorCode = error.response.data.code;

			if (errorCode === "ACCOUNT_INACTIVE") {
				store.dispatch(clearTokens());
				return Promise.reject(
					new Error("Your account is inactive. Please contact support.")
				);
			} else if (errorCode === "NOT_VERIFIED") {
				return Promise.reject(
					new Error(
						"User is not verified. Please complete the verification process."
					)
				);
			}
		}

		if (
			error.response &&
			error.response.status === 401 &&
			!originalRequest._retry
		) {
			originalRequest._retry = true;
			const state = store.getState();
			const refreshToken = state.refreshToken;

			if (refreshToken) {
				try {
					const { data } = await axios.post(`/api/getRefreshToken`, {
						refreshToken,
					});
					store.dispatch(
						setTokens({
							accessToken: data.accessToken,
							refreshToken: data.refreshToken,
						})
					);
					originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
					return userApiClient(originalRequest);
				} catch (refreshError) {
					store.dispatch(clearTokens());
				}
			} else {
				console.error("No refresh token available");
			}
		}
		return Promise.reject(error);
	}
);

export default userApiClient;
