import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const token = Cookies.get('feedflow_token') || '';

export const creditTransaction = async (amount: number, type: string, description: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/users/credits/transaction`,
    { amount, type, description },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );
  return response.data;
};

export const fetchUserProfile = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });

  return response.data;
};

export const fetchAllUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

export const fetchSavedItem = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/feed/saved`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });

  return response.data;
};

export const fetchReportedItem = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/feed/reported`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });

  return response.data;
};

export const saveItem = async (itemId: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/feed/save/${itemId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );
  return response.data;
};

export const reportItem = async (itemId: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/feed/report/${itemId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );
  return response.data;
};

export const shareItem = async (itemId: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/feed/share/${itemId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );
  return response.data;
};

export const updateUserCreditTransaction = async (userId: string, amount: number, description: string) => {
  const response = await axios.put(
    `${API_BASE_URL}/api/users/${userId}/credits`,
    { amount, description },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );
  return response.data;
};