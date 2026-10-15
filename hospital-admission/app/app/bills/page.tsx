"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Loading from "../loading";

type Bill = {
  _id: string;
  amount: number;
  paid: boolean;
  billType?: string;
  billFileUrl?: string;
  createdAt: string;
};

export default function BillsPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAmount, setNewAmount] = useState("");
  const [newBillType, setNewBillType] = useState("");
  const [newBillFile, setNewBillFile] = useState<string>("");

  useEffect(() => {
    if (!patientId) return;

    fetch(`/api/bills/${patientId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setBills(data);
        setLoading(false);
      });
  }, [patientId]);

  const handleAddBill = async () => {
    if (!newAmount || !newBillType) return alert("Enter amount and bill type");

    const res = await fetch(`/api/bills/${patientId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(newAmount),
        billType: newBillType,
        billFileUrl: newBillFile,
      }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    setBills([data, ...bills]);
    setNewAmount("");
    setNewBillType("");
    setNewBillFile("");
  };

  const deleteBill = async (billId: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;

    const res = await fetch(`/api/bills/delete-one/${billId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data.error);

    setBills(bills.filter((b) => b._id !== billId));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setNewBillFile(reader.result as string);
    reader.readAsDataURL(file);
  };

  const togglePaid = async (billId: string, paid: boolean) => {
    const res = await fetch(`/api/bills/update/${billId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    setBills(bills.map((b) => (b._id === billId ? data : b)));
  };

  if (loading) return Loading;

  return (
    <main style={{ padding: 20,minHeight: "100vh",backgroundColor: "#f0f2f5"}}>
      {/* Add New Bill Form */}
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center", 
          }}
        >

          <input
            type="text"
            placeholder="Bill Type"
            value={newBillType}
            onChange={(e) => setNewBillType(e.target.value)}
            style={{ ...inputStyle, flex: "1 1 180px" }}
          />

          <input
            type="number"
            placeholder="Amount"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            style={{ ...inputStyle, flex: "1 1 140px" }}
          />

          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <label style={fileInputStyle}>
              Click to upload file
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                style={fileInputHidden}
              />
            </label>
          </div>

          <button onClick={handleAddBill} style={buttonStyleBlue}>
            Add Bill
          </button>
        </div>
      </div>

      {/* Bills Table */}
      <div style={{ ...cardStyle }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>File</th>
              <th style={thStyle}>Paid</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => {
              const dateObj = new Date(bill.createdAt);
              const dateStr = dateObj.toLocaleDateString("en-GB");
              const timeStr = dateObj.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <tr key={bill._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>{dateStr}</td>
                  <td style={tdStyle}>{timeStr}</td>
                  <td style={tdStyle}>{bill.billType || "-"}</td>
                  <td style={tdStyle}>₹{bill.amount}</td>
                  <td style={tdStyle}>
                    {bill.billFileUrl ? (
                      <a
                        href={bill.billFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#1976d2", fontWeight: 500 }}
                      >
                        Download
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={bill.paid}
                      onChange={(e) => togglePaid(bill._id, e.target.checked)}
                    />
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => deleteBill(bill._id)} style={buttonStyleRed}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

// Styles
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: 12,
  borderBottom: "2px solid #ccc",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: 12,
};

// Styles
const cardStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
  backgroundColor: "#ffffff",
  animation: "cardFadeUp 0.35s ease-out",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 14,
  height: 44,          // 👈 SAME HEIGHT
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  transition: "all 0.2s",
};

const buttonStyleRed: React.CSSProperties = {
  ...buttonStyle,
  background: "linear-gradient(90deg, #f44336, #e53935)",
  boxShadow: "0 4px 12px rgba(244,67,54,0.3)",
};
const buttonStyleBlue: React.CSSProperties = {
  ...buttonStyle,
  background: "linear-gradient(90deg, #2196f3, #1976d2)",
  boxShadow: "0 4px 12px rgba(33,150,243,0.3)",
};

const fileInputStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 8,
  border: "2px dashed #ccc",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s",
  color: "#555",
  fontWeight: 500,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 44,          // 👈 match input height
  boxSizing: "border-box",
};

const fileInputHidden: React.CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "100%",
  opacity: 0,
  cursor: "pointer",
};
