import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer";

export async function GET(req, { params }) {
  const { id } = await params;

  const report = await prisma.survey.findUnique({
    where: { id },
  });

  if (!report) {
    return new Response("Report not found", { status: 404 });
  }

  const ai =
    typeof report.aiInsights === "string"
      ? JSON.parse(report.aiInsights)
      : report.aiInsights;

  // ✅ Safe helpers
  const renderText = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return item.description || item.title || JSON.stringify(item);
  };

  const renderTitle = (item) => {
    if (!item || typeof item === "string") return "";
    return item.area || item.opportunity || "";
  };

  const html = `
  <html>
    <head>
      <style>
        body { font-family: sans-serif; padding: 40px; }
        h1 { font-size: 28px; }

        .card {
          background: #f4f6ff;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .section { margin-top: 30px; }

        .box {
          padding: 10px;
          background: #f9fafb;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .gap { background: #ffe4e6; }
        .opp { background: #dcfce7; }

        .chip {
          display: inline-block;
          padding: 6px 12px;
          margin: 4px;
          background: #eef2ff;
          border-radius: 20px;
          font-size: 12px;
        }

        h4 { margin-top: 15px; }

        .page-break {
          page-break-before: always;
        }
      </style>
    </head>

    <body>

      <h1>AI Maturity Report</h1>

      <div class="card">
        <h2>Score: ${report.finalScore.toFixed(2)}</h2>
        <h3>Maturity: ${report.maturityLevel}</h3>
      </div>

      <div class="section">
        <h3>Gaps</h3>
        ${(ai?.gaps || [])
          .map(
            (g) => `
          <div class="box gap">
            <strong>${renderTitle(g)}</strong>
            <p>${renderText(g)}</p>
          </div>`
          )
          .join("")}
      </div>

      <div class="section">
        <h3>Opportunities</h3>
        ${(ai?.opportunities || [])
          .map(
            (o) => `
          <div class="box opp">
            <strong>${renderTitle(o)}</strong>
            <p>${renderText(o)}</p>
          </div>`
          )
          .join("")}
      </div>

      <div class="section">
        <h3>Executive Summary</h3>
        <p><strong>Current State:</strong> ${ai?.summary?.current_state || ""}</p>
        <p><strong>Key Risk:</strong> ${ai?.summary?.key_risk || ""}</p>
        <p><strong>Recommended Focus:</strong> ${ai?.summary?.recommended_focus || ""}</p>
      </div>

      <div class="page-break"></div>

      <div class="section">
        <h3>AI Transformation Roadmap</h3>

        <h4>Short Term</h4>
        ${(ai?.roadmap?.short_term || [])
          .map((item) => `<div class="box">${renderText(item)}</div>`)
          .join("")}

        <h4>Mid Term</h4>
        ${(ai?.roadmap?.mid_term || [])
          .map((item) => `<div class="box">${renderText(item)}</div>`)
          .join("")}

        <h4>Long Term</h4>
        ${(ai?.roadmap?.long_term || [])
          .map((item) => `<div class="box">${renderText(item)}</div>`)
          .join("")}
      </div>

      <div class="section">
        <h3>Recommended Tools</h3>

        <h4>Data</h4>
        <div>
          ${(ai?.tools?.data || [])
            .map((tool) => `<span class="chip">${tool}</span>`)
            .join("")}
        </div>

        <h4>AI</h4>
        <div>
          ${(ai?.tools?.ai || [])
            .map((tool) => `<span class="chip">${tool}</span>`)
            .join("")}
        </div>

        <h4>Cloud</h4>
        <div>
          ${(ai?.tools?.cloud || [])
            .map((tool) => `<span class="chip">${tool}</span>`)
            .join("")}
        </div>
      </div>

    </body>
  </html>
  `;

  const browser = await puppeteer.launch({
    headless: "new",
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=report-${id}.pdf`,
    },
  });
}