import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ReportsPage() {
  const reports = await prisma.survey.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>
        AI Assessment Reports
      </h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <thead style={{ background: "#f4f6ff" }}>
          <tr>
            <th style={th}>Date</th>
            <th style={th}>Score</th>
            <th style={th}>Maturity</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((r) => (
            <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={td}>
                {new Date(r.createdAt).toLocaleDateString()}
              </td>
              <td style={td}>{r.finalScore.toFixed(2)}</td>
              <td style={td}>{r.maturityLevel}</td>

              <td style={td}>
                <Link href={`/reports/${r.id}`}>
                  <button style={viewBtn}>View</button>
                </Link>

               <a href={`/api/reports/${r.id}`} target="_blank">
                <button style={pdfBtn}>Download PDF</button>
              </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: 12, textAlign: "left" };
const td = { padding: 12 };

const viewBtn = {
  padding: "6px 12px",
  marginRight: 8,
  background: "#6366f1",
  color: "white",
  border: "none",
  borderRadius: 6,
};

const pdfBtn = {
  padding: "6px 12px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 6,
};