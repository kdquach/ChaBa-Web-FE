
import React, { useEffect, useState } from "react";
import { Select, Input } from "antd";
import { getDistricts, getProvinces, getWards } from "vietnam-provinces";

const AddressForm = ({ value = {}, onChange, disabled }) => {
    const [address, setAddress] = useState({
        city: null,
        district: null,
        ward: null,
        street: "",
    });

    useEffect(() => {
        const val = Array.isArray(value) ? value[0] : value;
        const newAddress = {
            city: val?.city?.code || null,
            district: val?.district?.code || null,
            ward: val?.ward?.code || null,
            street: val?.street || "",
        };

        // ✅ chỉ set nếu khác với state hiện tại
        if (JSON.stringify(newAddress) !== JSON.stringify(address)) {
            setAddress(newAddress);
        }
    }, [value]);


    // Lấy tất cả tỉnh/thành
    const provincesList = getProvinces();
    const districtsList = address.city ? getDistricts(address.city) : [];
    const wardsList = address.district ? getWards(address.district) : [];
    const ward = wardsList.find((w) => w.code === address.ward);

    const handleChange = (field, val) => {
        let newAddress = { ...address, [field]: val }

        if (field === "city") {
            newAddress = { ...newAddress, district: null, ward: null, street: "" };
        } else if (field === "district") {
            newAddress = { ...newAddress, ward: null, street: "" };
        } else if (field === "ward") {
            newAddress = { ...newAddress, street: "" };
        }
        setAddress(newAddress);
        onChange?.({
            street: newAddress.street,
            ward: wardsList.find((w) => w.code === newAddress.ward) || null,
            district: districtsList.find((d) => d.code === newAddress.district) || null,
            city: provincesList.find((p) => p.code === newAddress.city) || null,
        });
    }
    return (
        <div style={{ display: "flex", gap: "10px", flexDirection: "column", ...(disabled && { pointerEvents: 'none', opacity: 0.6 }) }}>
            <Select
                placeholder="Chọn Tỉnh/Thành phố"
                onChange={v => handleChange("city", v)}
                value={address.city}
                disabled={disabled}
            >
                {provincesList.map((p) => (
                    <Select.Option key={p.code} value={p.code}>
                        {p.name}
                    </Select.Option>
                ))}
            </Select>

            <Select
                placeholder="Chọn Quận/Huyện"
                onChange={v => handleChange("district", v)}
                value={address.district}
                disabled={!address.city}
            >
                {districtsList.map((d) => (
                    <Select.Option key={d.code} value={d.code}>
                        {d.name}
                    </Select.Option>
                ))}
            </Select>

            <Select
                placeholder="Chọn Phường/Xã"
                onChange={v => handleChange("ward", v)}
                value={address.ward}
                disabled={!address.district}
            >
                {wardsList.map((w) => (
                    <Select.Option key={w.code} value={w.code}>
                        {w.name}
                    </Select.Option>
                ))}
            </Select>

            <Input.TextArea placeholder="Nhập tên đường, số nhà..."
                value={address.street}
                onChange={e => handleChange("street", e.target.value)}
                disabled={!address.city || !address.district || !address.ward}
            />
        </div >
    );
};


export default AddressForm