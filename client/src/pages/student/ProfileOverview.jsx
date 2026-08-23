import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowRight, Award, BriefcaseBusiness, PencilLine, Sparkles, User2 } from "lucide-react";
import { normalizeExternalUrl } from "@/lib/utils";

export default function ProfileOverview() {
  const [profile, setProfile] = useState(null);
  const [basic, setBasic] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [applications, setApplications] = useState([]);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, applicationsRes, certificatesRes] = await Promise.all([
          api.get("/profile/me"),
          api.get("/applications/me", { params: { view: "summary" } }),
          api.get("/certificates/me")
        ]);
        setProfile(profileRes.data.profile || null);
        setBasic(profileRes.data.basic || null);
        setCompletion(profileRes.data.completion || null);
        setApplications(applicationsRes.data.applications || []);
        setCertificates(certificatesRes.data.certificates || []);
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, []);

  const runningInternships = useMemo(
    () =>
      applications.filter((application) =>
        ["In Progress", "Submission Pending", "Submitted", "Revision Requested"].includes(
          application.status
        )
      ),
    [applications]
  );

  const completedInternships = useMemo(
    () => applications.filter((application) => application.status === "Completed"),
    [applications]
  );

  return (
    <div className="space-y-6">
      <div
        className="flex flex-col gap-4 rounded-[12px] border border-[color:var(--border)] bg-white/90 p-6 shadow-soft dark:bg-[#1d1d29]/70 md:flex-row md:items-center md:justify-between"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-[8px] border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Student profile hub
          </div>
          <h1 className="text-2xl font-semibold text-textPrimary">
            {basic?.fullName || profile?.fullName || "Your Profile"}
          </h1>
          <p className="max-w-2xl text-sm text-textSecondary">
            Track your profile strength, internship journey, certificates, and portfolio links in one place.
          </p>
        </div>
        <Link to="/student/profile/edit">
          <Button>
            Edit profile
            <PencilLine className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Profile completion", value: `${completion?.percentage || 0}%`, icon: User2 },
          { label: "Running internships", value: runningInternships.length, icon: BriefcaseBusiness },
          { label: "Completed internships", value: completedInternships.length, icon: ArrowRight },
          { label: "Certificates", value: certificates.length, icon: Award }
        ].map((item, index) => (
          <div
            key={item.label}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-primary/20 bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-textPrimary">{item.value}</p>
                <p className="text-xs text-textMuted">{item.label}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Profile details</CardTitle>
            <Link to="/student/profile/edit" className="text-xs font-medium text-primary">
              Update
            </Link>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm md:grid-cols-2">
            <Detail label="Email" value={basic?.email || profile?.email} />
            <Detail label="Phone" value={profile?.phone} />
            <Detail label="WhatsApp" value={profile?.whatsapp} />
            <Detail label="City / State" value={[profile?.city, profile?.state].filter(Boolean).join(", ")} />
            <Detail label="College" value={profile?.college} />
            <Detail label="Degree" value={profile?.degree} />
            <Detail label="Current Year" value={profile?.currentYear} />
            <Detail label="Graduation" value={profile?.graduationYear} />
            <Detail label="Skills" value={Array.isArray(profile?.skills) ? profile.skills.join(", ") : profile?.skills} />
            <Detail
              label="Preferred roles"
              value={
                Array.isArray(profile?.preferredRoles)
                  ? profile.preferredRoles.join(", ")
                  : profile?.preferredRoles
              }
            />
            <Detail label="GitHub" value={profile?.githubUrl} isLink />
            <Detail label="LinkedIn" value={profile?.linkedinUrl} isLink />
            <Detail label="Portfolio" value={profile?.portfolioUrl} isLink />
            <Detail label="Resume" value={profile?.resumeUrl} isLink />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Journey summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {applications.length === 0 ? (
              <p className="text-sm text-textMuted">
                No internship history yet. Once you start applying, your activity will appear here.
              </p>
            ) : (
              applications.slice(0, 6).map((application) => (
                <div
                  key={application._id}
                  className="rounded-[10px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-textPrimary">
                        {application.internship?.title || "Internship"}
                      </p>
                      <p className="text-[11px] text-textMuted">
                        {application.durationKey} · {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Running internships</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {runningInternships.length === 0 ? (
              <p className="text-sm text-textMuted">No running internships right now.</p>
            ) : (
              runningInternships.map((application) => (
                <div
                  key={application._id}
                  className="rounded-[10px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-textPrimary">
                        {application.internship?.title}
                      </p>
                      <p className="text-[11px] text-textMuted">
                        {application.timeline?.daysLeft ?? 0} days left · {application.durationKey}
                      </p>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Certificates and history</CardTitle>
            <Link to="/student/certificates" className="text-xs font-medium text-primary">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {certificates.length === 0 ? (
              <p className="text-sm text-textMuted">
                Completed internships and certificates will appear here.
              </p>
            ) : (
              certificates.slice(0, 4).map((certificate) => (
                <div
                  key={certificate._id}
                  className="rounded-[10px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-3"
                >
                  <p className="text-sm font-medium text-textPrimary">{certificate.role}</p>
                  <p className="text-[11px] text-textMuted">
                    {certificate.certificateId} · {new Date(certificate.completionDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value, isLink = false }) {
  return (
    <div className="space-y-1 rounded-[10px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-textMuted">{label}</p>
      {isLink && value ? (
        <a href={normalizeExternalUrl(value)} target="_blank" rel="noreferrer" className="break-all text-sm text-primary">
          {value}
        </a>
      ) : (
        <p className="text-sm text-textSecondary">{value || "Not added yet"}</p>
      )}
    </div>
  );
}
