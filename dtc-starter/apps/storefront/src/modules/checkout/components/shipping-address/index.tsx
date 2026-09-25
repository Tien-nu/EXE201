import { HttpTypes } from "@medusajs/types"
import { Container } from "@modules/common/components/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": cart?.shipping_address?.country_code || "vn",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  // Vietnam Administrative Units State
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])

  const addressParts = (cart?.shipping_address?.address_1 || "").split(", ")
  const initialWard = addressParts.length >= 2 ? addressParts.pop() || "" : ""
  const initialStreet = addressParts.join(", ")

  const [selectedProvince, setSelectedProvince] = useState<string>(cart?.shipping_address?.province || "")
  const [selectedDistrict, setSelectedDistrict] = useState<string>(cart?.shipping_address?.city || "")
  const [selectedWard, setSelectedWard] = useState<string>(initialWard)
  const [streetAddress, setStreetAddress] = useState<string>(initialStreet)

  // Prevent sync to formData on first render if nothing actually changed by the user
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch provinces on mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(console.error)
  }, [])

  // Fetch districts when province changes
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

  // Fetch wards when district changes
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

  // Sync back to formData
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      return
    }
    const fullAddress = [streetAddress, selectedWard].filter(Boolean).join(", ")
    setFormData(prev => ({
      ...prev,
      "shipping_address.province": selectedProvince,
      "shipping_address.city": selectedDistrict,
      "shipping_address.address_1": fullAddress
    }))
  }, [selectedProvince, selectedDistrict, selectedWard, streetAddress, isInitialized])


  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    if (address) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "vn",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))

      setSelectedProvince(address.province || "")
      setSelectedDistrict(address.city || "")
      const parts = (address.address_1 || "").split(", ")
      if (parts.length >= 2) {
        setSelectedWard(parts.pop() || "")
        setStreetAddress(parts.join(", "))
      } else {
        setStreetAddress(address.address_1 || "")
        setSelectedWard("")
      }
    }

    if (email) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        email: email,
      }))
    }
  }

  useEffect(() => {
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart])

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
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as unknown as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Tên"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label="Họ"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
        <Input
          label="Số điện thoại"
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          data-testid="shipping-phone-input"
          required
        />
        <Input
          label="Công ty (tuỳ chọn)"
          name="shipping_address.company"
          value={formData["shipping_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="shipping-company-input"
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
        name="shipping_address.country_code"
        value="vn"
      />
      <input
        type="hidden"
        name="shipping_address.province"
        value={formData["shipping_address.province"]}
      />
      <input
        type="hidden"
        name="shipping_address.city"
        value={formData["shipping_address.city"]}
      />
      <input
        type="hidden"
        name="shipping_address.address_1"
        value={formData["shipping_address.address_1"]}
      />

      <div className="my-8">
        <Checkbox
          label="Billing address same as shipping address"
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>
      <div className="mb-4">
        <Input
          label="Email liên hệ"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          data-testid="shipping-email-input"
        />
      </div>
    </>
  )
}

export default ShippingAddress
