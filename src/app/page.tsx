"use client";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { LuRadioTower } from "react-icons/lu";
import { IoMdAlert } from "react-icons/io";
import { MdAutoGraph } from "react-icons/md";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-5 pt-32 pb-20 text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            The world's best free{" "}
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              uptime monitoring
            </span>{" "}
            service.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Everything is totally{" "}
            <span className="text-green-400 font-semibold">FREE</span>.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/register"
              className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-colors"
            >
              Start monitoring your apps
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <section className="container mx-auto px-5 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <LuRadioTower className="text-green-400 w-16 h-16" />,
                title: "Comprehensive Monitoring",
                description: "Get visibility into every part of your system, all in one place.",
              },
              {
                icon: <IoMdAlert className="text-red-500 w-16 h-16" />,
                title: "Instant Alerts",
                description: "Real-time notifications to help you detect issues before they impact users.",
              },
              {
                icon: <MdAutoGraph className="text-blue-400 w-16 h-16" />,
                title: "Detailed Analytics",
                description: "Gain insights from data and uncover trends with in-depth analytics.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="group flex flex-col items-center text-center p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-card-foreground/10 hover:border-green-400/30 transition-all duration-300"
              >
                <div className="mb-6 transform transition-transform group-hover:scale-110 duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}