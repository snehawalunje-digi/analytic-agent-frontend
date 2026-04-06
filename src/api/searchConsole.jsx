import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL

export async function fetchSearchConsoleOverview(userId, startDate, endDate) {
  const { data } = await axios.get(`${BASE_URL}/api/search-console/overview`, {
    params: { userId, startDate, endDate },
  });
  return data;
}

export async function fetchSearchConsoleTopQueries(userId, startDate, endDate) {
  const { data } = await axios.get(`${BASE_URL}/api/search-console/top-queries`, {
    params: { userId, startDate, endDate },
  });
  return data;
}

export async function fetchSearchConsoleTopPages(userId, startDate, endDate) {
  const { data } = await axios.get(`${BASE_URL}/api/search-console/top-pages`, {
    params: { userId, startDate, endDate },
  });
  return data;
}

export async function fetchSearchConsoleDevices(userId, startDate, endDate) {
  const { data } = await axios.get(`${BASE_URL}/api/search-console/devices`, {
    params: { userId, startDate, endDate },
  });
  return data;
}

export async function fetchSearchConsoleCountries(userId, startDate, endDate) {
  const { data } = await axios.get(`${BASE_URL}/api/search-console/countries`, {
    params: { userId, startDate, endDate },
  });
  return data;
}

export async function fetchSearchConsoleQueryPages(userId, startDate, endDate) {
  const { data } = await axios.get(`${BASE_URL}/api/search-console/query-pages`, {
    params: { userId, startDate, endDate },
  });
  return data;
}

export async function fetchSearchConsoleCompare(userId, params) {
  const { data } = await axios.get(`${BASE_URL}/api/search-console/compare`, {
    params: { userId, ...params },
  });
  return data;
}

export async function fetchSearchConsoleLowCtr(userId, startDate, endDate) {
  const { data } = await axios.get(`${BASE_URL}/api/search-console/low-ctr`, {
    params: {
      userId,
      startDate,
      endDate,
      minImpressions: 100,
      maxCtr: 0.02,
    },
  });
  return data;
}