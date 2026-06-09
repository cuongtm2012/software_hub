import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

/** @deprecated Redirect — merged into /admin/projects */
export default function ExternalRequestsRedirect() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/admin/projects?source=public");
  }, [navigate]);
  return (
    <div className="flex justify-center items-center min-h-[40vh]">
      <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
    </div>
  );
}
