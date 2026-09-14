import { getApiUrl } from "../../api-config";

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(getApiUrl(`/api/jobs/${params.id}`), { cache: "no-store" });
    if (!res.ok) return { title: "Job | EthioJobs Connect" };
    const data = await res.json();
    const job = data.job || {};
    const title = `${job.title || "Job"} | EthioJobs Connect`;
    const desc = job.description
      ? job.description.slice(0, 160)
      : `Apply for ${job.title || "this position"} at EthioJobs Connect.`;
    return {
      title,
      description: desc,
      openGraph: {
        title,
        description: desc,
        type: "website",
        siteName: "EthioJobs Connect",
      },
      twitter: { card: "summary", title, description: desc },
    };
  } catch {
    return { title: "Job | EthioJobs Connect" };
  }
}

export default function JobDetailLayout({ children }) {
  return children;
}
