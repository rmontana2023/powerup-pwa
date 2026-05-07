const PSGC_BASE = "https://psgc.gitlab.io/api";

export const fetchProvinces = async () => {
  const res = await fetch(`${PSGC_BASE}/provinces/`);
  console.log("Fetching provinces...");
  console.log("Response:", res);

  if (!res.ok) {
    throw new Error("Failed to fetch provinces");
  }

  return res.json();
};

export const fetchCities = async (provinceCode: string) => {
  const res = await fetch(`${PSGC_BASE}/provinces/${provinceCode}/cities-municipalities/`);

  if (!res.ok) {
    throw new Error("Failed to fetch cities");
  }

  return res.json();
};

export const fetchBarangays = async (cityCode: string) => {
  const res = await fetch(`${PSGC_BASE}/cities-municipalities/${cityCode}/barangays/`);

  if (!res.ok) {
    throw new Error("Failed to fetch barangays");
  }

  return res.json();
};
