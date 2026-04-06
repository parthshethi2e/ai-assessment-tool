import puppeteer from "puppeteer";
import { prisma } from "@/lib/prisma";

function parseJson(value) {
  return typeof value === "string" ? JSON.parse(value) : value;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function GET(_request, { params }) {
  const { id } = await params;

  const report = await prisma.survey.findUnique({
    where: { id },
  });

  if (!report) {
    return new Response("Report not found", { status: 404 });
  }

  const answers = parseJson(report.answers) || {};
  const ai = parseJson(report.aiInsights) || {};
  const profile = answers.profile || {};
  const notes = answers.notes || {};
  const assessment = answers.assessment || {};

  const sectionScores = (assessment.scoredSections || [])
    .map(
      (section) => `
        <div class="score-row">
          <div class="score-head">
            <span>${escapeHtml(section.title)}</span>
            <span>${escapeHtml(section.score)}/5</span>
          </div>
          <div class="bar"><div class="fill" style="width:${(Number(section.score || 0) / 5) * 100}%"></div></div>
        </div>
      `
    )
    .join("");

  const html = `
    <html>
      <head>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 42px;
            font-family: Inter, Arial, sans-serif;
            color: #0f172a;
            background: #f8fbff;
          }
          h1, h2, h3, h4, p { margin: 0; }
          .hero {
            padding: 28px;
            border-radius: 28px;
            background: linear-gradient(180deg, #0f172a, #1e293b);
            color: white;
          }
          .muted { color: rgba(255,255,255,0.72); }
          .grid-4 {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-top: 18px;
          }
          .metric {
            background: #ffffff;
            border: 1px solid #dbe4ee;
            border-radius: 20px;
            padding: 16px;
          }
          .metric .label {
            font-size: 11px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #64748b;
          }
          .metric .value {
            margin-top: 8px;
            font-size: 18px;
            font-weight: 700;
          }
          .section {
            margin-top: 22px;
            padding: 22px;
            border-radius: 24px;
            background: white;
            border: 1px solid #dbe4ee;
          }
          .cards {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            margin-top: 16px;
          }
          .card {
            border-radius: 18px;
            padding: 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
          }
          .rose { background: #fff1f2; border-color: #fecdd3; }
          .green { background: #ecfdf5; border-color: #bbf7d0; }
          .label {
            font-size: 11px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #0891b2;
            font-weight: 700;
          }
          .body {
            margin-top: 10px;
            font-size: 13px;
            line-height: 1.65;
            color: #475569;
          }
          .score-row { margin-top: 14px; }
          .score-head {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin-bottom: 6px;
          }
          .bar {
            width: 100%;
            height: 8px;
            border-radius: 999px;
            background: #e2e8f0;
          }
          .fill {
            height: 8px;
            border-radius: 999px;
            background: linear-gradient(90deg, #0ea5e9, #0f172a);
          }
          .chips { margin-top: 12px; }
          .chip {
            display: inline-block;
            margin: 0 8px 8px 0;
            padding: 8px 12px;
            border-radius: 999px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            font-size: 12px;
          }
          .roadmap {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
            margin-top: 16px;
          }
          .roadmap-item {
            margin-top: 10px;
            padding: 12px;
            border-radius: 16px;
            background: white;
            border: 1px solid #e2e8f0;
            font-size: 13px;
            line-height: 1.65;
            color: #475569;
          }
        </style>
      </head>
      <body>
        <div class="hero">
          <div class="label">AI readiness report</div>
          <h1 style="margin-top:10px;font-size:34px;">${escapeHtml(profile.organizationName || "Organization report")}</h1>
          <p class="muted" style="margin-top:10px;font-size:14px;line-height:1.7;">
            ${escapeHtml(profile.organizationType || "Organization")} • ${escapeHtml(profile.sector || "Sector not provided")} • ${escapeHtml(profile.sizeBand || "Size not provided")}
          </p>
        </div>

        <div class="grid-4">
          <div class="metric"><div class="label">Overall score</div><div class="value">${escapeHtml(report.finalScore.toFixed(2))}</div></div>
          <div class="metric"><div class="label">Stage</div><div class="value">${escapeHtml(report.maturityLevel)}</div></div>
          <div class="metric"><div class="label">Benchmark</div><div class="value">${escapeHtml(assessment.benchmark || "n/a")}</div></div>
          <div class="metric"><div class="label">Priority</div><div class="value">${escapeHtml(notes.priority || "n/a")}</div></div>
        </div>

        <div class="section">
          <div class="label">Executive summary</div>
          <h2 style="margin-top:8px;font-size:24px;">${escapeHtml(ai.summary?.headline || "Executive summary")}</h2>
          <div class="cards">
            <div class="card"><div class="label">Current state</div><p class="body">${escapeHtml(ai.summary?.current_state)}</p></div>
            <div class="card"><div class="label">Key risk</div><p class="body">${escapeHtml(ai.summary?.key_risk)}</p></div>
            <div class="card"><div class="label">Recommended focus</div><p class="body">${escapeHtml(ai.summary?.recommended_focus)}</p></div>
          </div>
        </div>

        <div class="section">
          <div class="label">Section scorecard</div>
          <h2 style="margin-top:8px;font-size:24px;">Capability profile</h2>
          ${sectionScores}
        </div>

        <div class="section">
          <div class="label">Priorities</div>
          <h2 style="margin-top:8px;font-size:24px;">Gaps and opportunities</h2>
          <div class="cards">
            ${(ai.gaps || [])
              .map(
                (item) => `
                  <div class="card rose">
                    <div style="font-weight:700;">${escapeHtml(item.area)}</div>
                    <p class="body">${escapeHtml(item.description)}</p>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="cards">
            ${(ai.opportunities || [])
              .map(
                (item) => `
                  <div class="card green">
                    <div style="font-weight:700;">${escapeHtml(item.opportunity)}</div>
                    <p class="body">${escapeHtml(item.description)}</p>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>

        <div class="section">
          <div class="label">Roadmap</div>
          <h2 style="margin-top:8px;font-size:24px;">Transformation plan</h2>
          <div class="roadmap">
            <div class="card">
              <div style="font-weight:700;">0-3 months</div>
              ${(ai.roadmap?.short_term || []).map((item) => `<div class="roadmap-item">${escapeHtml(item)}</div>`).join("")}
            </div>
            <div class="card">
              <div style="font-weight:700;">3-6 months</div>
              ${(ai.roadmap?.mid_term || []).map((item) => `<div class="roadmap-item">${escapeHtml(item)}</div>`).join("")}
            </div>
            <div class="card">
              <div style="font-weight:700;">6-12 months</div>
              ${(ai.roadmap?.long_term || []).map((item) => `<div class="roadmap-item">${escapeHtml(item)}</div>`).join("")}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="label">Tooling guidance</div>
          <h2 style="margin-top:8px;font-size:24px;">Suggested stack categories</h2>
          <h4 style="margin-top:16px;">Data</h4>
          <div class="chips">${(ai.tools?.data || []).map((tool) => `<span class="chip">${escapeHtml(tool)}</span>`).join("")}</div>
          <h4 style="margin-top:12px;">AI</h4>
          <div class="chips">${(ai.tools?.ai || []).map((tool) => `<span class="chip">${escapeHtml(tool)}</span>`).join("")}</div>
          <h4 style="margin-top:12px;">Cloud</h4>
          <div class="chips">${(ai.tools?.cloud || []).map((tool) => `<span class="chip">${escapeHtml(tool)}</span>`).join("")}</div>
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "16px",
      right: "16px",
      bottom: "16px",
      left: "16px",
    },
  });
  await browser.close();

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=ai-readiness-report-${id}.pdf`,
    },
  });
}
