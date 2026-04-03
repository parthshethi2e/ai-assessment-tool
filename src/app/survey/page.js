"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrganizationPage() {
  const router = useRouter();

  const [org, setOrg] = useState({
    name: "",
    industry: "",
    size: "",
    geography: "",
    contactName: "",
    email: "",
  });

  const [errors, setErrors] = useState({});

  // ---------- STYLES ----------
  const container = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fb",
  };

  const card = {
    width: "600px",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  };

  const input = (field) => ({
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: errors[field] ? "1px solid red" : "1px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
  });

  const errorText = {
    color: "red",
    fontSize: "12px",
    marginTop: "4px",
  };

  const button = {
    marginTop: "15px",
    padding: "14px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    width: "100%",
  };

  // ---------- VALIDATION ----------
  const validate = () => {
    let newErrors = {};

    if (!org.name) newErrors.name = "Organization name required";
    if (!org.industry) newErrors.industry = "Select industry";
    if (!org.size) newErrors.size = "Select company size";
    if (!org.email || !org.email.includes("@"))
      newErrors.email = "Valid email required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- NEXT ----------
  const handleNext = () => {
    if (!validate()) return;

    localStorage.setItem("org", JSON.stringify(org));
    router.push("/survey/data");
  };

  // ---------- UI ----------
  return (
    <div style={container}>
      <div style={card}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>
          Organization Profile
        </h1>

        <p style={{ color: "#666", marginBottom: 20 }}>
          Let’s understand your organization context
        </p>

        <div style={{ display: "grid", gap: "15px" }}>
          {/* NAME */}
          <div>
            <input
              placeholder="Organization Name"
              style={input("name")}
              onChange={(e) =>
                setOrg({ ...org, name: e.target.value })
              }
            />
            {errors.name && <p style={errorText}>{errors.name}</p>}
          </div>

          {/* INDUSTRY + SIZE */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: "100%" }}>
              <select
                style={input("industry")}
                onChange={(e) =>
                  setOrg({ ...org, industry: e.target.value })
                }
              >
                <option value="">Select Industry</option>
                <option>Healthcare</option>
                <option>Technology</option>
                <option>Finance</option>
                <option>Retail</option>
              </select>
              {errors.industry && (
                <p style={errorText}>{errors.industry}</p>
              )}
            </div>

            <div style={{ width: "100%" }}>
              <select
                style={input("size")}
                onChange={(e) =>
                  setOrg({ ...org, size: e.target.value })
                }
              >
                <option value="">Company Size</option>
                <option>1-10</option>
                <option>10-50</option>
                <option>50-200</option>
                <option>200+</option>
              </select>
              {errors.size && (
                <p style={errorText}>{errors.size}</p>
              )}
            </div>
          </div>

          {/* GEOGRAPHY */}
          <input
            placeholder="Geography (Optional)"
            style={input()}
            onChange={(e) =>
              setOrg({ ...org, geography: e.target.value })
            }
          />

          {/* CONTACT */}
          <div style={{ display: "flex", gap: 10 }}>
            <input
              placeholder="Your Name"
              style={input()}
              onChange={(e) =>
                setOrg({ ...org, contactName: e.target.value })
              }
            />

            <div style={{ width: "100%" }}>
              <input
                placeholder="Email"
                style={input("email")}
                onChange={(e) =>
                  setOrg({ ...org, email: e.target.value })
                }
              />
              {errors.email && (
                <p style={errorText}>{errors.email}</p>
              )}
            </div>
          </div>

          {/* BUTTON */}
          <button onClick={handleNext} style={button}>
            Begin Assessment →
          </button>
        </div>
      </div>
    </div>
  );
}