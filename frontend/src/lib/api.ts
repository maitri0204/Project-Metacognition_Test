import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ───
export const authAPI = {
  signup: (data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    mobile?: string;
    country?: string;
    state?: string;
    city?: string;
    classGrade?: string;
    schoolName?: string;
    board?: string;
  }) => api.post("/auth/signup", data),

  verifySignupOTP: (data: { email: string; otp: string }) =>
    api.post("/auth/verify-signup-otp", data),

  login: (data: { email: string }) =>
    api.post("/auth/login", data),

  verifyOTP: (data: { email: string; otp: string }) =>
    api.post("/auth/verify-otp", data),

  getProfile: () =>
    api.get("/auth/profile"),
};

// ─── Questions API (admin only) ───
export const questionAPI = {
  getAll: (testType: string = "student") =>
    api.get("/questions", { params: { testType } }),

  add: (data: {
    questionText: string;
    domain: string;
    domainNumber: number;
    parameter: string;
    parameterNumber: number;
    testType?: string;
  }) => api.post("/questions", data),

  update: (id: string, data: { questionText: string }) =>
    api.put(`/questions/${id}`, data),

  remove: (id: string) => api.delete(`/questions/${id}`),
};

// ─── Test API (student) ───
export const testAPI = {
  getQuestions: () => api.get("/test/questions"),

  submit: (data: {
    answers: { questionId: string; selectedOption: string; score: number }[];
  }) => api.post("/test/submit", data),

  getResult: (id: string) => api.get(`/test/results/${id}`),

  getMyResults: () => api.get("/test/my-results"),
};

// ─── Admin Test API ───
export const adminTestAPI = {
  getAllResults: () => api.get("/test/admin/results"),
  getResult: (id: string) => api.get(`/test/results/${id}`),
  getStudentResults: (studentId: string) => api.get(`/test/student/${studentId}`),
};

// ─── Parent Test API (student) ───
export const parentTestAPI = {
  getQuestions: () => api.get("/parent-test/questions"),

  submit: (data: {
    parentInfo: {
      firstName: string;
      middleName?: string;
      lastName: string;
      mobile: string;
      email: string;
      relation: string;
    };
    answers: { questionId: string; selectedOption: string; score: number }[];
  }) => api.post("/parent-test/submit", data),

  getResult: (id: string) => api.get(`/parent-test/results/${id}`),

  getMyResults: () => api.get("/parent-test/my-results"),
};

// ─── Admin Parent Test API ───
export const adminParentTestAPI = {
  getAllResults: () => api.get("/parent-test/admin/results"),
  getResult: (id: string) => api.get(`/parent-test/results/${id}`),
  getStudentParentResults: (studentId: string) => api.get(`/parent-test/student/${studentId}`),
};

export default api;
