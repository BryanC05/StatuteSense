export async function fetchLegalTemplate(type = "Contract") {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET || "production";
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId || !dataset || !token) {
    return null;
  }

  const safeType = type.replace(/"/g, "\\\"");
  const query = `*[_type == \"legalTemplate\" && title == \"${safeType}\"][0]{_id, title, description, promptTemplate, defaultTask}`;
  const url = `https://${projectId}.api.sanity.io/v2026-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data?.result ?? null;
}
