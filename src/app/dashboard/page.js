import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const surveys = await prisma.survey.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ padding: 30 }}>
      <h1>Saved Assessments</h1>

      {surveys.length === 0 && <p>No records found</p>}

      {surveys.map((s) => (
        <div
          key={s.id}
          style={{
            padding: 15,
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            marginBottom: 15,
            background: "#f9fafb",
          }}
        >
          <h3>Score: {s.finalScore.toFixed(2)}</h3>
          <p>Maturity: {s.maturityLevel}</p>
          <p>
            Date: {new Date(s.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}