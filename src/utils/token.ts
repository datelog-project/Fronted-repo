import api from "../api/api";

export const reissueToken = async (): Promise<string | null> => {
  try {
    const res = await api.post("/auth/reissue");
    const newToken = res.data.accessToken;

    localStorage.setItem("accessToken", newToken);
    console.log("Access Token 재발급 성공:", newToken);
    return newToken;
  } catch (err) {
    console.error("Access Token 재발급 실패:", err);
    return null;
  }
};