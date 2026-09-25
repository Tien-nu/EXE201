import { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import React, { useEffect, useState } from "react"

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.company": cart?.billing_address?.company || "",
    "billing_address.city": cart?.billing_address?.city || "",
    "billing_address.country_code": cart?.billing_address?.country_code || "vn",
    "billing_address.province": cart?.billing_address?.province || "",
    "billing_address.phone": cart?.billing_address?.phone || "",
  })

  // Vietnam Administrative Units State
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])

  const addressParts = (cart?.billing_address?.address_1 || "").split(", ")
  const initialWard = addressParts.length >= 2 ? addressParts.pop() || "" : ""
  const initialStreet = addressParts.join(", ")

  const [selectedProvince, setSelectedProvince] = useState<string>(cart?.billing_address?.province || "")
  const [selectedDistrict, setSelectedDistrict] = useState<string>(cart?.billing_address?.city || "")
  const [selectedWard, setSelectedWard] = useState<string>(initialWard)
  const [streetAddress, setStreetAddress] = useState<string>(initialStreet)

  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find(p => p.name === selectedProvince)
      if (province) {
        fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
          .then(res => res.json())
          .then(data => setDistricts(data.districts))
          .catch(console.error)
      }
    } else {
      setDistricts([])
      setSelectedDistrict("")
    }
  }, [selectedProvince, provinces])

  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find(d => d.name === selectedDistrict)
      if (district) {
        fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
          .then(res => res.json())
          .then(data => setWards(data.wards))
          .catch(console.error)
      }
    } else {
      setWards([])
      setSelectedWard("")
    }
  }, [selectedDistrict, districts])

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      return
    }
    const fullAddress = [streetAddress, selectedWard].filter(Boolean).join(", ")
    setFormData(prev => ({
      ...prev,
      "billing_address.province": selectedProvince,
      "billing_address.city": selectedDistrict,
      "billing_address.address_1": fullAddress
    }))
  }, [selectedProvince, selectedDistrict, selectedWard, streetAddress, isInitialized])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Tên"
          name="billing_address.first_name"
          autoComplete="given-name"
          value={formData["billing_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="billing-first-name-input"
        />
        <Input
          label="Họ"
          name="billing_address.last_name"
          autoComplete="family-name"
          value={formData["billing_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="billing-last-name-input"
        />
        <Input
          label="Số điện thoại"
          name="billing_address.phone"
          autoComplete="tel"
          value={formData["billing_address.phone"]}
          onChange={handleChange}
          data-testid="billing-phone-input"
          required
        />
        <Input
          label="Công ty (tuỳ chọn)"
          name="billing_address.company"
          value={formData["billing_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="billing-company-input"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4">
        <div className="grid grid-cols-3 gap-4">
          <select 
            className="flex items-center justify-between px-4 py-2 border rounded-md text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
            value={selectedProvince} 
            onChange={(e) => setSelectedProvince(e.target.value)}
            required
          >
            <option value="">Chọn Tỉnh / Thành phố</option>
            {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
          </select>
          <select 
            className="flex items-center justify-between px-4 py-2 border rounded-md text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white disabled:bg-gray-100"
            value={selectedDistrict} 
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedProvince}
            required
          >
            <option value="">Chọn Quận / Huyện</option>
            {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
          </select>
          <select 
            className="flex items-center justify-between px-4 py-2 border rounded-md text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white disabled:bg-gray-100"
            value={selectedWard} 
            onChange={(e) => setSelectedWard(e.target.value)}
            disabled={!selectedDistrict}
            required
          >
            <option value="">Chọn Phường / Xã</option>
            {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
          </select>
        </div>

        <Input
          label="Số nhà, tên đường (VD: 123 Lê Lợi)"
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          required
        />
      </div>

      <input
        type="hidden"
        name="billing_address.country_code"
        value="vn"
      />
      <input
        type="hidden"
        name="billing_address.province"
        value={formData["billing_address.province"]}
      />
      <input
        type="hidden"
        name="billing_address.city"
        value={formData["billing_address.city"]}
      />
      <input
        type="hidden"
        name="billing_address.address_1"
        value={formData["billing_address.address_1"]}
      />
    </>
  )
}

export default BillingAddress
