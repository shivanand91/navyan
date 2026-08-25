import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { getDurationPriceLabel, isPaidDuration, getEffectiveDurationPrice } from "@/utils/internshipPricing";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  ArrowRight,
  Sparkles,
  Clock,
  Award,
  BookOpen,
  Users,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
  Lock,
  User,
  MapPin,
  Laptop,
  Calendar,
  ChevronDown,
  Gift,
  QrCode,
  AlertTriangle,
  ChevronRight,
  FileText
} from "lucide-react";

export default function InternshipDetail() {
  const { slug, duration: urlDurationKey } = useParams();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blockingApplication, setBlockingApplication] = useState(null);
  const [selectedKey, setSelectedKey] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Apply Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [motivation, setMotivation] = useState("");
  const [paymentSession, setPaymentSession] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [timer, setTimer] = useState(0);
  const [success, setSuccess] = useState(false);

  // Fetch Internship Details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/internships/slug/${slug}`);
        setInternship(data.internship);
        
        // Determine starting selected key
        if (urlDurationKey) {
          setSelectedKey(urlDurationKey);
        } else if (data.internship?.durations?.length > 0) {
          setSelectedKey(data.internship.durations[0].key);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, urlDurationKey]);

  // Fetch Blocking Application Status
  useEffect(() => {
    if (!user || user.role !== "student") return;
    const fetchApplications = async () => {
      try {
        const { data } = await api.get("/applications/me");
        const blocking = (data.applications || []).find(app =>
          ["Applied", "Under Review", "Shortlisted", "Selected", "In Progress", "Submission Pending", "Submitted", "Revision Requested"].includes(app.status)
        );
        setBlockingApplication(blocking || null);
      } catch (err) {
        console.error("Error fetching applications", err);
      }
    };
    fetchApplications();
  }, [user]);

  // Countdown timer for Payment QR
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Get currently selected duration options
  const selectedDuration = useMemo(() => {
    if (!internship || !selectedKey) return null;
    const durations = internship.durations && internship.durations.length > 0
      ? internship.durations
      : [
          { key: "4-weeks", label: "4 weeks", isPaid: true, price: 49, benefits: ["Workspace Access", "3 Real-world Projects", "Verifiable Certificate", "Weekly Q&A"] },
          { key: "3-months", label: "3 months", isPaid: true, price: 2499, benefits: ["Workspace Access", "3 Real-world Projects", "Live Classes", "Stipend Reward", "Navyan Swag Box"] },
          { key: "6-months", label: "6 months", isPaid: true, price: 4499, benefits: ["Workspace Access", "3 Real-world Projects", "Live Classes", "Dedicated Mentor", "Elite Swag Hoodie Box"] }
        ];
    return durations.find((d) => d.key === selectedKey) || durations[0];
  }, [internship, selectedKey]);

  // Get dynamic reward description text
  const getRewardsText = (duration) => {
    if (!duration) return "";
    if (duration.rewards && duration.rewards.length > 0) {
      return duration.rewards.join(", ");
    }
    if (duration.key === "3-months") return "Top 3 Performers Reward: ₹5,000 + Swag Box";
    if (duration.key === "6-months") return "Top Performer Reward: ₹8,000 + Elite Swag Hoodie Box";
    if (duration.key === "4-weeks") return "Digital Certificate of Completion + Premium Work Recognition";
    return "";
  };

  // Construct plans list for dynamic comparison table
  const plans = useMemo(() => {
    if (!internship) return [];
    const durationsList = internship.durations && internship.durations.length > 0
      ? internship.durations
      : [
          { key: "4-weeks", label: "4 weeks", isPaid: true, price: 49 },
          { key: "3-months", label: "3 months", isPaid: true, price: 2499 },
          { key: "6-months", label: "6 months", isPaid: true, price: 4499 }
        ];
    return durationsList.map((d) => {
      const is4W = d.key === "4-weeks";
      const is3M = d.key === "3-months";
      const is6M = d.key === "6-months";
      return {
        key: d.key,
        name: d.label || d.key,
        price: getDurationPriceLabel(d),
        type: isPaidDuration(d) ? "Paid track" : "Free track",
        liveClasses: d.schedule || (is4W ? "Self-paced guides" : is3M ? "Weekend live classes" : is6M ? "Weekend live advanced classes" : "Included"),
        mentorship: d.mentorship || (is4W ? "Weekly group Q&A" : is3M ? "1-on-1 Project reviews" : is6M ? "Dedicated Slack Mentor & reviews" : "Group Support"),
        swag: d.swag || (is4W ? "Digital Certificate" : is3M ? "Navyan T-shirt & Sticker Box" : is6M ? "Premium Hoodie, T-shirt & Swag Kit" : "Digital Certificate"),
        reward: d.rewards?.join(", ") || (is4W ? "Performance Recognition" : is3M ? "Top 3: ₹5,000" : is6M ? "Top Performer: ₹8,000" : "Certificate of Merit"),
        projects: d.projects?.join(", ") || "3 Real-world Projects"
      };
    });
  }, [internship]);

  // Handle Cohort Key Selection
  const handleKeySelect = (key) => {
    setSelectedKey(key);
    navigate(`/internship/${slug}/${key}`, { replace: true });
  };

  // Open Checkout / Apply Modal or redirect if unauthenticated
  const handleApplyClick = () => {
    if (!user) {
      toast.info("Please log in to apply for this internship.");
      navigate(`/login?redirect=/internship/${slug}/${selectedKey}`);
      return;
    }
    if (user.role !== "student") {
      toast.error("Only student accounts can apply for internships.");
      return;
    }
    setShowApplyModal(true);
    setSuccess(false);
    setPaymentSession(null);
    setUtrNumber("");
  };

  // Generate QR code call
  const handleGeneratePaymentQr = async () => {
    setPaymentLoading(true);
    try {
      const { data } = await api.post("/applications/payment-intent", {
        internshipId: internship._id,
        durationKey: selectedKey
      });
      setPaymentSession(data);
      setTimer(300); // 5 minutes
      setUtrNumber("");
      toast.success("UPI QR Code generated! Complete your payment within 5 mins.");
    } catch (error) {
      console.error(error);
      const response = error?.response?.data;
      if (response?.action === "COMPLETE_PROFILE") {
        toast.error(response.message || "Complete your profile before payment.");
        navigate("/student/profile/edit");
      } else {
        toast.error(response?.message || "Could not generate payment QR code.");
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  // Submit Application
  const handleSubmitApplication = async () => {
    setSubmitting(true);
    try {
      const payload = {
        internshipId: internship._id,
        durationKey: selectedKey,
        motivation
      };

      const isPaid = selectedDuration.isPaid || getEffectiveDurationPrice(selectedDuration) > 0;
      if (isPaid) {
        if (!paymentSession?.paymentAttemptId) {
          toast.error("Generate a payment QR before submitting.");
          setSubmitting(false);
          return;
        }
        if (timer <= 0) {
          toast.error("Payment session expired. Please generate a new QR.");
          setSubmitting(false);
          return;
        }
        const cleanUtr = utrNumber.replace(/\D/g, "");
        if (cleanUtr.length !== 12) {
          toast.error("Enter the 12-digit UPI reference number shown in your payment app.");
          setSubmitting(false);
          return;
        }
        payload.paymentAttemptId = paymentSession.paymentAttemptId;
        payload.utrNumber = cleanUtr;
      }

      await api.post("/applications", payload);
      setSuccess(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  // Format Timer
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <section className="navyan-section">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 space-y-6">
          <Skeleton height={320} borderRadius={16} />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <Skeleton height={40} width="40%" />
              <Skeleton count={6} />
            </div>
            <div>
              <Skeleton height={250} borderRadius={16} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!internship) {
    return (
      <section className="navyan-section">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="navyan-panel p-10 space-y-4">
            <p className="font-display text-2xl font-bold text-textPrimary">Internship Not Found</p>
            <p className="text-textSecondary text-sm">The internship cohort you are looking for may have been archived.</p>
            <Link to="/internships">
              <Button variant="outline" className="mt-4">
                Browse Live Internships
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const isPaid = selectedDuration?.isPaid || getEffectiveDurationPrice(selectedDuration) > 0;
  const is4W = selectedKey === "4-weeks";
  const is3M = selectedKey === "3-months";
  const is6M = selectedKey === "6-months";

  return (
    <section className="relative min-h-screen bg-[color:var(--bg)] pb-24 text-[color:var(--text)]">
      {/* Hero Header */}
      <div className="border-b border-[color:var(--border)] bg-[color:var(--bg-secondary)]/50 py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-[8px] border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Live Application Window Open
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.04em] text-textPrimary leading-none">
                {internship.title}
              </h1>
              <p className="text-base md:text-lg leading-relaxed text-textSecondary max-w-2xl">
                {internship.shortDescription}
              </p>

              {/* Dynamic Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="inline-flex items-center gap-1.5 rounded-[8px] bg-[color:var(--card-elevated)] border border-[color:var(--border)] px-3 py-1.5 text-xs text-textSecondary">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Duration: {selectedDuration?.label || selectedKey}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-[8px] bg-[color:var(--card-elevated)] border border-[color:var(--border)] px-3 py-1.5 text-xs text-textSecondary">
                  <Laptop className="h-3.5 w-3.5 text-primary" />
                  <span>Mode: {internship.mode?.toUpperCase() || "REMOTE"}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-[8px] bg-[color:var(--card-elevated)] border border-[color:var(--border)] px-3 py-1.5 text-xs text-textSecondary">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>Openings: {internship.openings || "Open Track"}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-[8px] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                  {isPaid ? "Paid Cohort" : "Unpaid Track"}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              {internship.coverImageUrl ? (
                <div className="aspect-video w-full overflow-hidden rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] shadow-xl">
                  <img
                    src={internship.coverImageUrl}
                    alt={internship.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-[16px] border border-[color:var(--border)] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center p-6 text-center text-sm text-[color:var(--text-secondary)]">
                  Navyan Learning Cohort Visualizer
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Cohort Selector Section */}
            <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-textPrimary">Select Your Cohort Plan</h2>
                <p className="text-textSecondary text-sm mt-1">Different plan durations are designed for different experience levels and goals.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {(internship.durations || []).map((duration) => {
                  const isSelected = selectedKey === duration.key;
                  return (
                    <button
                      key={duration.key}
                      onClick={() => handleKeySelect(duration.key)}
                      type="button"
                      className={`relative flex flex-col items-start p-4 text-left rounded-[12px] border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                          : "border-[color:var(--border)] bg-[color:var(--card-elevated)] hover:border-[color:var(--border-strong)]"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <span className="text-xs uppercase font-bold tracking-wider text-[color:var(--text-muted)]">
                        {duration.isPaid || getEffectiveDurationPrice(duration) > 0 ? "Paid Track" : "Unpaid"}
                      </span>
                      <span className="text-lg font-bold text-textPrimary mt-1">
                        {duration.label || duration.key}
                      </span>
                      <span className="text-sm font-semibold text-primary mt-2">
                        {getDurationPriceLabel(duration)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedDuration && (
                <div className="bg-[color:var(--bg-secondary)] p-4 rounded-[12px] border border-[color:var(--border)] space-y-3">
                  <div className="flex items-center gap-2 text-textPrimary font-semibold text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Included in the {selectedDuration.label || selectedKey} Plan:</span>
                  </div>
                  <ul className="grid gap-2 sm:grid-cols-2 text-xs text-textSecondary">
                    {(selectedDuration.benefits && selectedDuration.benefits.length > 0
                      ? selectedDuration.benefits
                      : ["Workspace Access", "3 Real-world Projects", "Verifiable Certificate", "Weekly Q&A"]
                    ).map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                    {getRewardsText(selectedDuration) && (
                      <li className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400 sm:col-span-2 mt-1">
                        <Gift className="h-4 w-4 text-amber-500" />
                        <span>{getRewardsText(selectedDuration)}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Overview / Description */}
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-textPrimary">Role Overview & Learning Path</h2>
              <div className="text-sm leading-relaxed text-textSecondary whitespace-pre-line bg-[color:var(--card-elevated)] p-6 rounded-[16px] border border-[color:var(--border)]">
                {internship.description || "No full description configured."}
              </div>
            </div>

            {/* What you get - concrete value */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-textPrimary">What You Get & Professional Deliverables</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-3">
                  <div className="p-3 bg-primary/10 rounded-[10px] w-fit">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-textPrimary text-base">Verified Navyan Internship Certificate</h3>
                  <p className="text-textSecondary text-xs leading-relaxed">
                    Earn a verifiable, industry-standard completion certificate linked to your portfolio, directly queryable on Navyan verification portal.
                  </p>
                </div>

                <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-3">
                  <div className="p-3 bg-amber-500/10 rounded-[10px] w-fit">
                    <Gift className="h-5 w-5 text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-textPrimary text-base">Navyan Swag Box & Elite Rewards</h3>
                  <p className="text-textSecondary text-xs leading-relaxed">
                    Top performers in the 3 Months and 6 Months programs get physical swag kits (T-shirts, hoodies, and desk accessories) shipped directly.
                  </p>
                </div>

                <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-3">
                  <div className="p-3 bg-blue-500/10 rounded-[10px] w-fit">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-textPrimary text-base">Continuous Expert Mentorship</h3>
                  <p className="text-textSecondary text-xs leading-relaxed">
                    Interact directly with team leads, join weekend code reviews, and schedule live doubts sessions to resolve real-world project roadblocks.
                  </p>
                </div>

                <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-3">
                  <div className="p-3 bg-indigo-500/10 rounded-[10px] w-fit">
                    <BookOpen className="h-5 w-5 text-indigo-500" />
                  </div>
                  <h3 className="font-semibold text-textPrimary text-base">Practical, Production-Ready Portfolio</h3>
                  <p className="text-textSecondary text-xs leading-relaxed">
                    Write clean code, execute micro-services, and design full-stack architectures. Deploy products live to show actual recruiters.
                  </p>
                </div>
              </div>
            </div>

            {/* Special Section: "Why ₹49?" for 4-weeks */}
            {is4W && (
              <div className="rounded-[16px] border border-blue-500/20 bg-blue-500/5 p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-lg">
                  <HelpCircle className="h-5 w-5" />
                  <span>Why is the 4-Weeks Starter Plan ₹49?</span>
                </div>
                <p className="text-textSecondary text-sm leading-relaxed">
                  Navyan is committed to democratization. The ₹49 fee is not tuition. It is a commitment-filter to cover costs of server provisioning, structured dashboards, progress trackers, auto-grading services, and hosting of your evaluation workspace, ensuring we filter out spam registrations and dedicate resources to genuine students.
                </p>
              </div>
            )}

            {/* Special Section: 3-months weekend schedule */}
            {is3M && (
              <div className="rounded-[16px] border border-amber-500/20 bg-amber-500/5 p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-lg">
                  <Users className="h-5 w-5 text-amber-500" />
                  <span>Weekend Live Classes & Top 3 Performers (₹5,000)</span>
                </div>
                <p className="text-textSecondary text-sm leading-relaxed">
                  The 3 Months cohort is built for depth. Every weekend, join live masterclasses detailing state management, performance optimization, and database operations. At the end of the cohort, the top 3 performers are selected based on task grading, code reviews, and project presentations to receive a cash prize of ₹5,000 each!
                </p>
              </div>
            )}

            {/* Special Section: 6-months roadmaps */}
            {is6M && (
              <div className="rounded-[16px] border border-indigo-500/20 bg-indigo-500/5 p-6 space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                  <Laptop className="h-5 w-5 text-indigo-500" />
                  <span>Build. Work. Learn. Ship. (₹8,000 Reward)</span>
                </div>
                <p className="text-textSecondary text-sm leading-relaxed">
                  Our most intensive cohort. In the 6 Months track, you operate as an actual junior developer in a simulated squad. Learn system architectures, deploy CI/CD pipelines, and contribute to scale systems. The top performer is awarded a direct stipend reward of ₹8,000 and gets referred to Navyan's partner network.
                </p>
              </div>
            )}

            {/* Program Timeline */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-textPrimary">Program Timeline & Milestones</h2>
              <div className="relative border-l border-[color:var(--border)] ml-3 pl-6 space-y-8">
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 rounded-full border border-primary bg-[color:var(--bg)] p-1">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <h4 className="font-bold text-textPrimary text-base">Week 1: Foundations & Architecture Setup</h4>
                  <p className="text-textSecondary text-xs mt-1 leading-relaxed">
                    Set up your workspace repositories, clone boilerplates, understand design guidelines, and align with your mentors on deliverables.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 rounded-full border border-primary bg-[color:var(--bg)] p-1">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <h4 className="font-bold text-textPrimary text-base">Week 2-4: Core Development & Mid-term Evaluations</h4>
                  <p className="text-textSecondary text-xs mt-1 leading-relaxed">
                    Implement user stories, code key logic blocks, and submit tasks to Navyan dashboards. Receive structural code reviews and grades.
                  </p>
                </div>

                {!is4W && (
                  <>
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 rounded-full border border-primary bg-[color:var(--bg)] p-1">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <h4 className="font-bold text-textPrimary text-base">Month 2-3: Advanced Features, Integrations & Live Classes</h4>
                      <p className="text-textSecondary text-xs mt-1 leading-relaxed">
                        Integrate APIs, payment gateways, and perform optimization. Attend weekend live workshops to address industry-level system designs.
                      </p>
                    </div>

                    {is6M && (
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0.5 rounded-full border border-primary bg-[color:var(--bg)] p-1">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                        <h4 className="font-bold text-textPrimary text-base">Month 4-6: Production Capstones & Direct Placement referrals</h4>
                        <p className="text-textSecondary text-xs mt-1 leading-relaxed">
                          Assemble complete production suites, configure CI/CD deployments, present your work to panels, and gain certificate clearance.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Side-by-Side Comparison Section */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-textPrimary">Compare Duration Plans</h2>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-hidden rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)]">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[color:var(--border)] bg-[color:var(--bg-secondary)]">
                      <th className="p-4 font-bold text-textPrimary">Features</th>
                      {plans.map((p) => (
                        <th key={p.key} className={`p-4 font-bold text-textPrimary ${selectedKey === p.key ? "bg-primary/5 text-primary" : ""}`}>
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[color:var(--border)]">
                      <td className="p-4 font-semibold text-textPrimary">Price / Fee</td>
                      {plans.map((p) => (
                        <td key={p.key} className={`p-4 font-bold text-textPrimary ${selectedKey === p.key ? "bg-primary/5" : ""}`}>
                          {p.price}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-[color:var(--border)]">
                      <td className="p-4 font-semibold text-textPrimary">Type</td>
                      {plans.map((p) => (
                        <td key={p.key} className={`p-4 text-textSecondary ${selectedKey === p.key ? "bg-primary/5" : ""}`}>
                          {p.type}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-[color:var(--border)]">
                      <td className="p-4 font-semibold text-textPrimary">Classes</td>
                      {plans.map((p) => (
                        <td key={p.key} className={`p-4 text-textSecondary ${selectedKey === p.key ? "bg-primary/5" : ""}`}>
                          {p.liveClasses}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-[color:var(--border)]">
                      <td className="p-4 font-semibold text-textPrimary">Mentorship</td>
                      {plans.map((p) => (
                        <td key={p.key} className={`p-4 text-textSecondary ${selectedKey === p.key ? "bg-primary/5" : ""}`}>
                          {p.mentorship}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-[color:var(--border)]">
                      <td className="p-4 font-semibold text-textPrimary">Swag Package</td>
                      {plans.map((p) => (
                        <td key={p.key} className={`p-4 text-textSecondary ${selectedKey === p.key ? "bg-primary/5" : ""}`}>
                          {p.swag}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-[color:var(--border)]">
                      <td className="p-4 font-semibold text-textPrimary">Rewards</td>
                      {plans.map((p) => (
                        <td key={p.key} className={`p-4 font-semibold text-amber-600 dark:text-amber-400 ${selectedKey === p.key ? "bg-primary/5" : ""}`}>
                          {p.reward}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-textPrimary">Projects</td>
                      {plans.map((p) => (
                        <td key={p.key} className={`p-4 text-textSecondary ${selectedKey === p.key ? "bg-primary/5" : ""}`}>
                          {p.projects}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Carousel / Cards scroll */}
              <div className="md:hidden flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                {plans.map((p) => (
                  <div
                    key={p.key}
                    onClick={() => handleKeySelect(p.key)}
                    className={`flex-shrink-0 w-[270px] rounded-[16px] border p-5 space-y-4 bg-[color:var(--card)] ${
                      selectedKey === p.key
                        ? "border-primary bg-primary/5"
                        : "border-[color:var(--border)] bg-[color:var(--card-elevated)]"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-textPrimary text-base">{p.name}</h4>
                      <p className="text-primary font-extrabold text-lg mt-1">{p.price}</p>
                    </div>
                    <div className="space-y-2 text-[11px] text-textSecondary border-t border-[color:var(--border)] pt-3">
                      <div className="flex justify-between">
                        <span className="text-[color:var(--text-muted)] font-semibold">Type:</span>
                        <span>{p.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[color:var(--text-muted)] font-semibold">Classes:</span>
                        <span className="text-right">{p.liveClasses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[color:var(--text-muted)] font-semibold">Mentorship:</span>
                        <span className="text-right">{p.mentorship}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[color:var(--text-muted)] font-semibold">Swag:</span>
                        <span className="text-right">{p.swag}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-amber-600 dark:text-amber-400">
                        <span>Reward:</span>
                        <span>{p.reward}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-textPrimary">Frequently Asked Questions</h2>
              <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] overflow-hidden">
                {[
                  {
                    q: "Will I get a certificate at the end?",
                    a: "Yes, every plan includes a dynamic, verified digital certificate. You will be able to download it and host it on your LinkedIn profile."
                  },
                  {
                    q: "Can I upgrade my cohort duration plan later?",
                    a: "You can apply to upgrade your duration from the student dashboard in the first week of your active internship, subject to review."
                  },
                  {
                    q: "How are tasks graded and reviewed?",
                    a: "You upload code links or document PDFs onto your Navyan workspace. Our coordinators review submissions weekly and assign grading scores."
                  },
                  {
                    q: "Are the live weekend classes recorded?",
                    a: "Yes, for the 3M and 6M paid plans, all live cohorts are recorded and available in your student portal within 24 hours of the lecture."
                  }
                ].map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={index} className="border-b border-[color:var(--border)] last:border-0">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full flex items-center justify-between p-5 text-left font-semibold text-textPrimary text-sm hover:bg-[color:var(--bg-secondary)]"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`h-4 w-4 text-[color:var(--text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="p-5 pt-0 text-xs leading-relaxed text-textSecondary border-t border-[color:var(--border)] bg-[color:var(--bg-secondary)]/30">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sticky Desktop Apply CTA column */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-24 rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-lg space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-[color:var(--text-muted)]">Selected Cohort Plan</span>
                <h3 className="font-display text-2xl font-bold text-textPrimary">{selectedDuration?.label || selectedKey}</h3>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl font-extrabold text-primary">{getDurationPriceLabel(selectedDuration)}</span>
                  <span className="text-xs text-[color:var(--text-muted)]">{isPaid ? "one-time enrollment fee" : "fully free"}</span>
                </div>
              </div>

              {/* Skills summary checklist */}
              <div className="border-t border-[color:var(--border)] pt-4 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">Skills you will master:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(internship.skillsRequired || []).map((skill) => (
                    <span key={skill} className="text-[11px] bg-[color:var(--card-elevated)] border border-[color:var(--border)] px-2.5 py-1 rounded-[8px] text-textSecondary font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Application Block Info */}
              {blockingApplication ? (
                <div className="rounded-[12px] border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-700 dark:text-amber-400 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <Lock className="h-4 w-4 text-amber-500" />
                    <span>Application Locked</span>
                  </div>
                  <p className="leading-relaxed">
                    You already have an active application for <strong>{blockingApplication.internship?.title || "another track"}</strong>. Complete it to apply for new ones.
                  </p>
                  <Link to="/student" className="inline-flex items-center gap-1 font-bold text-primary hover:underline pt-1">
                    <span>Go to Dashboard</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <Button variant="accent" size="lg" className="w-full text-sm font-bold py-6 justify-center shadow-lg hover:scale-[1.02] transition-transform" onClick={handleApplyClick}>
                  Apply for {selectedDuration?.label || selectedKey}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              <p className="text-[10px] text-center text-[color:var(--text-muted)] leading-relaxed">
                Applying takes less than 2 minutes. Get instant portal access and cohort review dates after step verification.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Bottom CTA Bar (Mobile View) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[color:var(--border)] bg-[color:var(--card)]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-[color:var(--text-secondary)] uppercase">{selectedDuration?.label || selectedKey}</span>
          <p className="font-extrabold text-primary text-lg leading-none">{getDurationPriceLabel(selectedDuration)}</p>
        </div>

        {blockingApplication ? (
          <Link to="/student">
            <Button variant="outline" size="sm">
              View Active Application
            </Button>
          </Link>
        ) : (
          <Button variant="accent" size="sm" className="font-bold px-5" onClick={handleApplyClick}>
            Apply Now
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Checkout / Enrollment Flow Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-2xl space-y-6 my-8">
            
            {/* Close Button */}
            {!submitting && (
              <button
                onClick={() => setShowApplyModal(false)}
                className="absolute right-4 top-4 p-2 text-[color:var(--text-muted)] hover:text-textPrimary transition-colors"
              >
                <ChevronDown className="h-5 w-5 rotate-90" />
              </button>
            )}

            {success ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-textPrimary">Application Successful 🎉</h3>
                <p className="text-textSecondary text-sm max-w-sm mx-auto leading-relaxed">
                  Your application for the <strong>{internship.title} ({selectedDuration?.label || selectedKey})</strong> has been successfully received.
                  {isPaid ? " Our coordinators will verify your payment UTR code within 24 hours to active your plan." : " You can access your workspace workspace now."}
                </p>
                <div className="pt-4">
                  <Button variant="accent" onClick={() => { setShowApplyModal(false); navigate("/student"); }} className="w-full">
                    Go to Student Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-xl font-bold text-textPrimary">Confirm Your Application</h3>
                  <p className="text-textSecondary text-xs mt-1">Review the details of your selected plan below.</p>
                </div>

                {/* Plan detail overview card */}
                <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--bg-secondary)] p-4 space-y-2">
                  <div className="flex justify-between text-xs text-textSecondary">
                    <span>Internship:</span>
                    <span className="font-semibold text-textPrimary">{internship.title}</span>
                  </div>
                  <div className="flex justify-between text-xs text-textSecondary">
                    <span>Cohort Duration:</span>
                    <span className="font-semibold text-textPrimary">{selectedDuration?.label || selectedKey}</span>
                  </div>
                  <div className="flex justify-between text-xs text-textSecondary border-t border-[color:var(--border)] pt-2">
                    <span className="font-medium text-textPrimary">Enrollment Fee:</span>
                    <span className="font-extrabold text-primary">{getDurationPriceLabel(selectedDuration)}</span>
                  </div>
                </div>

                {/* Motivation Text */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider">
                    Why do you want to join this internship? (Optional)
                  </label>
                  <textarea
                    placeholder="Briefly describe your goals or experience..."
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    disabled={paymentLoading || submitting}
                    className="w-full rounded-[10px] border border-[color:var(--border)] bg-[color:var(--bg-secondary)] p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[70px] resize-none"
                  />
                </div>

                {/* UPI QR Code Generation block (For Paid plans) */}
                {isPaid && (
                  <div className="border-t border-[color:var(--border)] pt-4 space-y-4">
                    {!paymentSession ? (
                      <Button
                        variant="outline"
                        onClick={handleGeneratePaymentQr}
                        disabled={paymentLoading}
                        className="w-full py-5 text-xs font-semibold justify-center gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                      >
                        {paymentLoading ? "Generating Session..." : "Generate UPI Payment QR Code"}
                        <QrCode className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-[color:var(--bg-secondary)] p-4 rounded-[12px] border border-[color:var(--border)]">
                          
                          {/* QR Code image */}
                          <div className="bg-white p-2 rounded-[8px] border border-[color:var(--border)] flex-shrink-0">
                            {paymentSession.qrCodeDataUrl ? (
                              <img
                                src={paymentSession.qrCodeDataUrl}
                                alt="UPI Payment QR Code"
                                className="h-32 w-32 object-contain"
                              />
                            ) : (
                              <div className="h-32 w-32 bg-slate-100 flex items-center justify-center text-xs">QR Loading...</div>
                            )}
                          </div>

                          <div className="space-y-1.5 text-xs text-textSecondary flex-1">
                            <div className="flex justify-between items-center bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-[6px] font-semibold text-[10px] w-fit uppercase">
                              Session active: {formatTimer(timer)}
                            </div>
                            <p className="leading-relaxed text-[11px]">
                              Scan this QR with any UPI app (GPay, PhonePe, Paytm, BHIM) to pay <strong>{getDurationPriceLabel(selectedDuration)}</strong>.
                            </p>
                            <p className="text-[10px] text-[color:var(--text-muted)]">
                              Reference ID: <span className="font-mono text-textSecondary">{paymentSession.paymentReference}</span>
                            </p>
                          </div>
                        </div>

                        {/* UTR Input Form */}
                        {timer > 0 ? (
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-[color:var(--text-secondary)] uppercase tracking-wider">
                              Enter the 12-Digit UPI Transaction UTR Number
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={12}
                                placeholder="UTR Reference Number (12 Digits)"
                                value={utrNumber}
                                onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                                disabled={submitting}
                                className="w-full rounded-[10px] border border-[color:var(--border)] bg-[color:var(--bg-secondary)] p-3 pr-16 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                              <div className="absolute right-3 top-3.5 text-[10px] font-bold text-[color:var(--text-muted)]">
                                {utrNumber.length}/12 Digits
                              </div>
                            </div>
                            <p className="text-[10px] text-[color:var(--text-muted)] leading-relaxed">
                              Double-check your UTR. Entering incorrect payment references will lead to rejection of your internship application.
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-[12px] border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Payment Session expired. Please generate a new QR code to proceed.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Confirm Buttons */}
                <div className="pt-2 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowApplyModal(false)}
                    disabled={submitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    onClick={handleSubmitApplication}
                    disabled={
                      submitting ||
                      paymentLoading ||
                      (isPaid && (!paymentSession || timer <= 0 || utrNumber.length !== 12))
                    }
                    className="flex-1 justify-center"
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
