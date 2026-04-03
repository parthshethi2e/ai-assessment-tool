import { prisma } from "@/lib/prisma";

export default async function ReportDetail({ params }) {
  const { id } = await params; 

  if (!id) return <div>Invalid ID</div>;

  const report = await prisma.survey.findUnique({
    where: { id },
  });

  if (!report) return <div>Report not found</div>;

  const ai =
    typeof report.aiInsights === "string"
      ? JSON.parse(report.aiInsights)
      : report.aiInsights;

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      
      {/* HEADER */}
      <h1 style={{ fontSize: 28 }}>AI Maturity Dashboard</h1>

      {/* SCORE */}
      <div
        style={{
          padding: 20,
          borderRadius: 10,
          background: "#f4f6ff",
          marginTop: 20,
        }}
      >
        <h2>Score: {report.finalScore.toFixed(2)}</h2>
        <h3>Maturity: {report.maturityLevel}</h3>
      </div>

      {/* GAPS & OPPORTUNITIES */}
      <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
        
        {/* GAPS */}
        <div style={{ flex: 1 }}>
          <h3>Gaps</h3>
          {ai?.gaps?.map((g, i) => (
            <div
              key={i}
              style={{
                background: "#ffe4e6",
                padding: 12,
                marginBottom: 10,
                borderRadius: 8,
              }}
            >
              {typeof g === "string" ? (
                <p>{g}</p>
              ) : (
                <>
                  <strong>{g.area}</strong>
                  <p>{g.description}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* OPPORTUNITIES */}
        <div style={{ flex: 1 }}>
          <h3>Opportunities</h3>
          {ai?.opportunities?.map((o, i) => (
            <div
              key={i}
              style={{
                background: "#dcfce7",
                padding: 12,
                marginBottom: 10,
                borderRadius: 8,
              }}
            >
              {typeof o === "string" ? (
                <p>{o}</p>
              ) : (
                <>
                  <strong>{o.opportunity}</strong>
                  <p>{o.description}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SUMMARY */}
      <h3 style={{ marginTop: 30 }}>Executive Summary</h3>
      <div
        style={{
          background: "#f9fafb",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <p>
          <strong>Current State:</strong>{" "}
          {ai?.summary?.current_state}
        </p>

        <p>
          <strong>Key Risk:</strong>{" "}
          {ai?.summary?.key_risk}
        </p>

        <p>
          <strong>Recommended Focus:</strong>{" "}
          {ai?.summary?.recommended_focus}
        </p>
      </div>

      {/* ROADMAP */}
      <h3 style={{ marginTop: 40 }}>AI Transformation Roadmap</h3>

      <div style={{ display: "flex", gap: 20 }}>
        {[
          { title: "Short Term", data: ai?.roadmap?.short_term },
          { title: "Mid Term", data: ai?.roadmap?.mid_term },
          { title: "Long Term", data: ai?.roadmap?.long_term },
        ].map((section, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              background: "#f9fafb",
              padding: 20,
              borderRadius: 12,
            }}
          >
            <h4>{section.title}</h4>

            {section.data?.map((item, i) => (
              <div
                key={i}
                style={{
                  marginTop: 10,
                  padding: 10,
                  background: "white",
                  borderRadius: 8,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* TOOLS */}
      <h3 style={{ marginTop: 40 }}>Recommended Tools</h3>

      {[
        { title: "Data", data: ai?.tools?.data },
        { title: "AI", data: ai?.tools?.ai },
        { title: "Cloud", data: ai?.tools?.cloud },
      ].map((section, idx) => (
        <div key={idx} style={{ marginBottom: 20 }}>
          <h4>{section.title}</h4>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {section.data?.map((tool, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 14px",
                  background: "#eef2ff",
                  borderRadius: 20,
                }}
              >
                {tool}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}