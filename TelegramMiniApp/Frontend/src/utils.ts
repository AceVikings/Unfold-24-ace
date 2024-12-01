import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

export const setTokenCookies = (accessToken: any, refreshToken: any) => {
  // Decode the access token to extract its expiration time (exp)

  if (accessToken) {
    const decodedAccessToken = jwtDecode(accessToken);
    const accessTokenExpiry = decodedAccessToken.exp; // Unix timestamp (seconds)

    // Calculate the expiration time in days (for js-cookie library)
    const accessTokenExpiresInMs = accessTokenExpiry! * 1000 - Date.now();
    const accessTokenExpiresInDays =
      accessTokenExpiresInMs / (1000 * 60 * 60 * 24); // Convert to days

    // Set access token cookie with dynamic expiration
    Cookies.set("access_token", accessToken, {
      expires: accessTokenExpiresInDays, // Expires based on the token's expiration
      secure: true,
      sameSite: "Strict",
    });
  }

  if (refreshToken) {
    const decodedRefreshToken = jwtDecode(refreshToken);
    const refreshTokenExpiry = decodedRefreshToken.exp; // Unix timestamp (seconds)

    // Calculate the expiration time in days
    const refreshTokenExpiresInMs = refreshTokenExpiry! * 1000 - Date.now();
    const refreshTokenExpiresInDays =
      refreshTokenExpiresInMs / (1000 * 60 * 60 * 24); // Convert to days

    // Set refresh token cookie with dynamic expiration
    Cookies.set("refresh_token", refreshToken, {
      expires: refreshTokenExpiresInDays, // Expires based on the token's expiration
      secure: true,
      sameSite: "Strict",
    });
  }
};
