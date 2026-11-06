import { useState } from "react"
import { 
  HelpCircle, 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  Search, 
  LogIn, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  Sparkles,
  MessageSquare,
  ArrowRight
} from "lucide-react"

interface FAQItem {
  id: string
  category: "getting-started" | "ordering" | "payment" | "pickup"
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    id: "faq-1",
    category: "getting-started",
    question: "How do I log in or create an account?",
    answer: "You can easily sign in with your Google account in one click using the 'Sign in with Google' button. Since Google accounts don't share phone numbers by default, you will be prompted to add your active mobile number so we can send you SMS order and pickup notifications."
  },
  {
    id: "faq-2",
    category: "ordering",
    question: "How do I manage my cart (quantities and removals)?",
    answer: "Browse products from the catalog, select your quantities, and add items to your cart. Inside your cart page, you can freely increase or decrease item quantities, update quantities dynamically, or completely remove items before proceeding to checkout."
  },
  {
    id: "faq-3",
    category: "ordering",
    question: "How do I place an order successfully?",
    answer: "Once your items are in your cart, proceed to checkout. Choose your payment path, input your exact transaction reference and name, review your order breakdown, and click 'Place Order' to receive your unique tracking code instantly."
  },
  {
    id: "faq-4",
    category: "payment",
    question: "Which payment path is recommended and how fast is it?",
    answer: "Our recommended path is **CBE to CBE**. If you transfer from a CBE account to our official CBE account with the correct transaction ID (valid within 24 hours of generation) and exact matching payer name, verification completes automatically within **4 to 8 seconds**."
  },
  {
    id: "faq-5",
    category: "payment",
    question: "How does Telebirr payment verification work?",
    answer: "Telebirr payments are verified through our system's special automated verification process. While CBE transfers take only 4 to 8 seconds, Telebirr verification typically takes anywhere from a few minutes up to a maximum of 6 hours to fully sync and verify."},
  {
    id: "faq-6",
    category: "payment",
    question: "Why must my receipt name match my profile name?",
    answer: "To prevent fake orders and speed up your delivery, the sender's name on your mobile banking receipt must match the first and last name you type into the checkout form. (Note: This checks against the name you enter at checkout rather than your account profile, so if your receipt has a small typo, just type that exact name at checkout so our system verifies it instantly!)"},
  {
    id: "faq-7",
    category: "pickup",
    question: "How and when will I know my pickup details?",
    answer: "Once your payment is successfully verified by our automated system or manual check, the exact pickup point, date, and time frame will be dispatched directly to your registered Gmail and sent via SMS to your phone."
  },
  {
    id: "faq-8",
    category: "pickup",
    question: "Where can I find my verification code or QR code?",
    answer: "Navigate to your 'My Orders' dashboard after payment approval. A unique digital QR code and numeric collection pin will be displayed under your active order card for quick scanning by the pickup agent."
  }
]

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [expandedId, setExpandedId] = useState<string | null>("faq-1")

  const categories = [
    { label: "All Topics", value: "all", icon: HelpCircle },
    { label: "Getting Started", value: "getting-started", icon: LogIn },
    { label: "Ordering & Cart", value: "ordering", icon: ShoppingBag },
    { label: "Payments & Speed", value: "payment", icon: CreditCard },
    { label: "Pickup & Delivery", value: "pickup", icon: Truck },
  ]

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || faq.category === activeTab
    return matchesSearch && matchesTab
  })

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-hidden">
      {/* Glowing background ambient lights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-cyan-600/20 via-blue-600/20 to-purple-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        
        {/* Hero Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>Campus Delivery Support & System Guide</span>
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            How can we help you today?
          </h1>
          <p className="mt-3 text-base text-slate-400 sm:text-lg max-w-2xl mx-auto">
            Find fast answers for cart management, CBE vs. Telebirr payment sync speeds, and pickup verification.
          </p>
        </div>

        {/* Search Bar with Rich Shadow */}
        <div className="relative mt-10 max-w-2xl mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-lg opacity-75 transition duration-300" />
          <div className="relative flex items-center rounded-2xl border border-slate-800 bg-slate-900/90 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <Search className="ml-4 h-5 w-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics (e.g., CBE, cart, Telebirr scraper, QR)..."
              className="w-full bg-transparent px-4 py-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="mr-4 text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-md transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {categories.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all duration-200 shadow-sm ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.02]"
                    : "bg-slate-900/80 text-slate-400 border border-slate-800/80 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Critical Payment Notice Banner with Deep Shadow */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative backdrop-blur-xl">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-amber-500" />
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-amber-500/15 p-2.5 text-amber-400 border border-amber-500/20 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-300 tracking-wide">
                Payment Verification Guidelines
              </h3>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                <strong>CBE-to-CBE</strong> transfers verify automatically within <strong>4–8 seconds</strong> using transaction IDs generated within 24 hours. <strong>Telebirr</strong> payments utilize backend receipt HTML scraping and may take slightly longer. Always ensure your receipt payer name matches your profile precisely!
              </p>
            </div>
          </div>
        </div>

        {/* Accordion FAQ List with Soft Elevation Shadows */}
        <div className="mt-8 space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 py-16 text-center backdrop-blur-md shadow-lg">
              <HelpCircle className="mx-auto h-10 w-10 text-slate-600" />
              <p className="mt-3 text-sm text-slate-400">
                No matching topics found for "{searchQuery}".
              </p>
              <button
                onClick={() => { setSearchQuery(""); setActiveTab("all"); }}
                className="mt-3 text-xs text-cyan-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = expandedId === faq.id
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
                    isOpen
                      ? "border-cyan-500/40 bg-slate-900/90 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                      : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    className="flex w-full items-center justify-between p-5 text-left focus:outline-none"
                  >
                    <span className="flex items-center gap-3 text-sm sm:text-base font-semibold text-slate-200">
                      <ShieldCheck className={`h-5 w-5 shrink-0 transition-colors ${isOpen ? "text-cyan-400" : "text-slate-500"}`} />
                      {faq.question}
                    </span>
                    <div className={`ml-2 rounded-lg p-1 transition-transform duration-300 ${isOpen ? "rotate-180 bg-cyan-500/10 text-cyan-400" : "text-slate-500"}`}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 mt-1">
                      <p className="mt-2">{faq.answer}</p>
                      
                      {faq.category === "payment" && (
                        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400 shadow-inner">
                          <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                            <Clock className="h-3.5 w-3.5" /> CBE: 4–8 Secs | Telebirr: Scraper Sync
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> 24-Hour Txn Validity
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

{/* Support Footer Card */}
<div className="mt-12 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 text-center relative backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg">
    <MessageSquare className="h-6 w-6" />
  </div>
  <h3 className="mt-4 text-lg font-bold text-white">Still have questions or payment delays?</h3>
  <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
    Our campus dispatch team is available on Telegram to help resolve payment verification or order collection issues instantly.
  </p>
  <a
    href="https://t.me/Yared_Ku" 
    target="_blank"
    rel="noopener noreferrer"
    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-6 py-3 text-xs font-semibold text-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
  >
    <span>Chat on Telegram</span>
    <ArrowRight className="h-3.5 w-3.5" />
  </a>
</div>

      </main>
    </div>
  )
}