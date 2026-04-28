import { useRouter } from "next/router";
import TenderDetail from "@/components/ai-feedback/detail";
import VendorEvalDetail from "@/components/ai-feedback/ve-detail";

export default function DetailPage() {
  const router = useRouter();
  const module = (router.query.module as string) || "tender_summary";

  if (module === "vendor_eval") {
    return <VendorEvalDetail />;
  }

  return <TenderDetail />;
}
