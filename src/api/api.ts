import axios from "axios";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });

  failedQueue = [];
};


export const api = axios.create({
  baseURL: "http://localhost:8080", 
  withCredentials: true,
});


api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("[Interceptor] 401 Unauthorized 발생, 토큰 재발급 시도");
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              resolve(api(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          "http://localhost:8080/auth/reissue",
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        processQueue(null, newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api