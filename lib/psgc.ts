const PSGC_BASE = "https://psgc.gitlab.io/api";

export const fetchCities = async () => {
  const res = await fetch(`${PSGC_BASE}/cities-municipalities/`);
  return res.json();
};

export const fetchBarangays = async (cityCode: string) => {
  const res = await fetch(`${PSGC_BASE}/cities-municipalities/${cityCode}/barangays/`);
  return res.json();
};
