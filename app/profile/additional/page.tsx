"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import Swal from "sweetalert2";
import newlogo from "../../../public/assets/logo/powerup-new-logo.png";
import { useRouter } from "next/navigation";
import { Combobox } from "@headlessui/react";
import { fetchProvinces, fetchCities, fetchBarangays } from "@/lib/psgc";

interface AdditionalInfoForm {
  province: string;
  provinceCode: string;

  city: string;
  cityCode: string;

  barangay: string;
  barangayCode: string;

  street: string;
  zipCode: string;
}
interface PSGCItem {
  code: string;
  name: string;
}

export default function AdditionalInfoPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [form, setForm] = useState<AdditionalInfoForm>({
    province: "",
    provinceCode: "",

    city: "",
    cityCode: "",

    barangay: "",
    barangayCode: "",

    street: "",
    zipCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provinceQuery, setProvinceQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [barangayQuery, setBarangayQuery] = useState("");
  const [provinces, setProvinces] = useState<PSGCItem[]>([]);
  const [cities, setCities] = useState<PSGCItem[]>([]);
  const [barangays, setBarangays] = useState<PSGCItem[]>([]);


  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await fetchProvinces();

        const sorted = data.sort((a: any, b: any) => a.name.localeCompare(b.name));

        setProvinces(sorted);
      } catch (err) {
        console.error("Failed to load provinces", err);
      }
    };

    loadProvinces();
  }, []);
  
  const handleProvinceChange = async (value: string | null) => {
    if (!value) return;
    const selectedProvince = provinces.find((p) => p.name === value);

    if (!selectedProvince) return;

    setForm((prev) => ({
    ...prev,
    province: selectedProvince.name,
    provinceCode: selectedProvince.code,

    city: "",
    cityCode: "",

    barangay: "",
    barangayCode: "",
  }))

    setCities([]);
    setBarangays([]);

    try {
      const data = await fetchCities(selectedProvince.code);

      const sorted = data.sort((a: any, b: any) => a.name.localeCompare(b.name));

      setCities(sorted);
      setProvinceQuery("");
    } catch (err) {
      console.error("Failed to load cities", err);
    }
  };
  const handleCityChange = async (value: string | null) => {
  if (!value) return

  const selectedCity = cities.find((c) => c.name === value)

  if (!selectedCity) return

  setForm((prev) => ({
    ...prev,
    city: selectedCity.name,
    cityCode: selectedCity.code,

    barangay: "",
    barangayCode: ""
  }))

  setBarangays([])

  try {
    const data = await fetchBarangays(selectedCity.code)

    setBarangays(
      data.sort((a: any, b: any) =>
        a.name.localeCompare(b.name)
      )
    )
   setCityQuery(selectedCity.name);
  } catch (err) {
    console.error(err)
  }
  }
  const filteredProvinces =
    provinceQuery === ""
      ? provinces
      : provinces.filter((p) => p.name.toLowerCase().includes(provinceQuery.toLowerCase()));
  
 const filteredCities =
  cityQuery.trim() === ""
    ? cities
    : cities.filter((city) =>
        city.name
          .toLowerCase()
          .includes(cityQuery.toLowerCase())
      );
  const filteredBarangays =
    barangayQuery === ""
      ? barangays
      : barangays.filter((b) => b.name.toLowerCase().includes(barangayQuery.toLowerCase()));

  useEffect(() => {
    async function loadUser() {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Fetch saved additional info from backend
        const res = await fetch("/api/customer/me");
        const data = await res.json();
        if (data.customer) {
            setForm({
                province: data.customer.province || "",
                provinceCode: data.customer.provinceCode || "",

                city: data.customer.city || "",
                cityCode: data.customer.cityCode || "",

                barangay: data.customer.barangay || "",
                barangayCode: data.customer.barangayCode || "",

                street: data.customer.street || "",
                zipCode: data.customer.zipCode || "",
            });

            if (data.customer.provinceCode) {
                const cityData = await fetchCities(data.customer.provinceCode);
                setCities(
                  cityData.sort((a: PSGCItem, b: PSGCItem) =>
                    a.name.localeCompare(b.name)
                  )
                );
            }

            if (data.customer.cityCode) {
                const brgyData = await fetchBarangays(data.customer.cityCode);
                setBarangays(
                  brgyData.sort((a: PSGCItem, b: PSGCItem) =>
                    a.name.localeCompare(b.name)
                  )
                );
            }

            setProvinceQuery("");
            setCityQuery("");
            setBarangayQuery("");
        }
      } catch (err) {
        console.error("Failed to load user or customer info:", err);
      }
    }
    loadUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.provinceCode ||
      !form.cityCode ||
      !form.barangayCode ||
      !form.street.trim() ||
      !form.zipCode
      ){
      return Swal.fire({
      icon:"warning",
      title:"Incomplete Address",
      text:"Please complete your address.",
      confirmButtonColor:"#f97316"
      });
      }
    setLoading(true);
    setError("");

    try {
      const payload = {
          ...form,
          street: form.street.trim()
      };
      const res = await fetch("/api/customer/additional-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save info");

      // Show Swal success popup
      Swal.fire({
        icon: "success",
        title: data.customer.province ? "Updated!" : "Saved!",
        text: "Your additional information has been successfully saved.",
        confirmButtonColor: "#f97316",
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: err.message || "Failed to save information",
        confirmButtonColor: "#f97316",
      });
      setError(err.message || "Error saving data");
    } finally {
      setLoading(false);
    }
  };

const isEditMode = Boolean(
form.province ||
form.city ||
form.barangay ||
form.street ||
form.zipCode
);
  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center px-4 py-6 pb-24">
        {/* Back Button */}
        <div className="w-full max-w-md mb-4 flex justify-start">
          <button
            onClick={() => router.back()}
            className="bg-powerup-500 hover:bg-powerup-600 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            ← Back
          </button>
        </div>
        {/* Header Logo */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={newlogo} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>

        {/* Page Title */}
        <h1 className="text-2xl text-[var(--accent)] text-center mb-6 w-full max-w-md font-bold">
          Additional Information
        </h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 border border-gray-100 space-y-4"
        >
          {/* Province */}
        <div className="w-full">
          <Combobox value={form.province} onChange={handleProvinceChange}>
            <div className="relative">
              <Combobox.Input
                className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500"
                displayValue={(province: string) => province}
                onChange={(e) => setProvinceQuery(e.target.value)}
                placeholder="Select Province"
              />

              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                ▼
              </Combobox.Button>

              <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                {filteredProvinces.map((province) => (
                  <Combobox.Option
                    key={province.code}
                    value={province.name}
                    className={({ active }) =>
                      `cursor-pointer px-4 py-2 ${
                        active ? "bg-orange-500 text-white" : "text-black"
                      }`
                    }
                  >
                    {province.name}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        {/* City */}

      <div className="w-full">
        <Combobox value={form.city} onChange={handleCityChange} >
          <div className="relative">
            {/* INPUT */}
            <Combobox.Input
              className={`w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-orange-500 ${
              !form.provinceCode
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white"
              }`}
              displayValue={(city: string) => city}
              value={cityQuery}
              onFocus={() => setCityQuery("")}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="Select City / Municipality"
            />

            {/* DROPDOWN BUTTON */}
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
              ▼
            </Combobox.Button>

            {/* OPTIONS */}
           <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg">
              {filteredCities.length === 0 ? (
                <div className="p-3 text-gray-500">No results found</div>
              ) : (
                filteredCities.map((city) => (
                  <Combobox.Option
                    key={city.code}
                    value={city.name}
                    className={({ active }) =>
                      `cursor-pointer px-4 py-2 ${
                      active
                      ? "bg-orange-500 text-white"
                      : "text-black"
                      }`
                      }
                  >
                    {city.name}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </div>
        </Combobox>
      </div>

        {/* Barangay */}

        <div className="w-full">
          <Combobox
            value={form.barangay}
            onChange={(value) => {
              const selectedBarangay = barangays.find(
                (b) => b.name === value
              )

              setForm((prev) => ({
                ...prev,
                barangay: selectedBarangay?.name || "",
                barangayCode: selectedBarangay?.code || ""
              }))
              setBarangayQuery(selectedBarangay.name);
            }}
          >
            <div className="relative">
              {/* INPUT */}
              <Combobox.Input
               className={`w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-orange-500 ${
                !form.cityCode
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white"
                }`}
                displayValue={(barangay: string) => barangay}
                onChange={(e) => setBarangayQuery(e.target.value)}
                placeholder="Select Barangay"
                onFocus={() => {
                    setBarangayQuery("");
                }}
              />

              {/* BUTTON */}
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                ▼
              </Combobox.Button>

              {/* OPTIONS */}
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white border border-gray-500 rounded-lg shadow-lg">
                {filteredBarangays.length === 0 ? (
                  <div className="p-3 text-gray-500">No results found</div>
                ) : (
                  filteredBarangays.map((barangay) => (
                    <Combobox.Option
                      key={barangay.code}
                      value={barangay.name}
                      className={({ active }) =>
                        `cursor-pointer px-4 py-2 ${
                        active
                        ? "bg-orange-500 text-white"
                        : "text-black"
                        }`
                      }
                    >
                      {barangay.name}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        {/* Street */}

        <div className="w-full">
          <input
            type="text"
            value={form.street}
            placeholder="Street / House No. / Purok"
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                street: e.target.value,
             }))
            }
            className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* ZIP */}

        <div className="w-full">
          <input
            type="text"
            value={form.zipCode}
            maxLength={4}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="ZIP Code"
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                zipCode: e.target.value.replace(/\D/g, ""),
              }))
            }
            className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500"
          />
        </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold p-3 rounded-lg transition-all disabled:opacity-50"
          >
          {loading
            ? "Saving..."
            : isEditMode
            ? "Update Information"
            : "Save Information"}
          </button>
        </form>
      </main>
    </LayoutWithNav>
  );
}

