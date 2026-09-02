import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/axios";

const SHARE_TOKEN_STORAGE_KEY = "navyan_share_token";

export default function ShareLinkRedirect() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const resolve = async () => {
      try {
        const { data } = await api.get(`/share-earn/links/${encodeURIComponent(token)}`, { cache: false });
        localStorage.setItem(SHARE_TOKEN_STORAGE_KEY, data.token);
        navigate(data.redirectPath, { replace: true });
      } catch {
        navigate("/internships", { replace: true });
      }
    };
    resolve();
  }, [navigate, token]);

  return <div className="navyan-section min-h-[55vh] px-4 text-center text-sm text-textSecondary">Opening your Navyan internship...</div>;
}
