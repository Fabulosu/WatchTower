"use client";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { LuRadioTower } from "react-icons/lu";
import { IoMdAlert } from "react-icons/io";
import { MdAutoGraph } from "react-icons/md";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative overflow-hidden">
      <Navbar />

      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-background to-background/50 -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-r from-green-500/30 to-blue-500/30 blur-[120px] -z-10" />

      <main className="relative">
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-5 pt-40 pb-32 text-center relative"
        >
          <div className="absolute top-20 left-10 w-20 h-20 bg-green-500/10 rounded-full blur-xl" />
          <div className="absolute top-40 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />

          <motion.div variants={itemVariants} className="relative z-10">
            <span className="inline-block px-4 py-2 rounded-full bg-card/30 backdrop-blur-sm border border-card-foreground/10 text-sm font-medium mb-6">
              🚀 Launching our new monitoring platform
            </span>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              The world's best free{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  uptime monitoring
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                  <path d="M0 7c30-7 70-7 100 0" stroke="url(#gradient)" strokeWidth="2" fill="none" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>{" "}
              service.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Monitor your applications with enterprise-grade tools.{" "}
              <span className="text-green-400 font-semibold">100% FREE</span>.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/register"
                  className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-300"
                >
                  Start monitoring
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>

              <Link
                href="/demo"
                className="inline-flex items-center px-8 py-4 rounded-full text-lg font-semibold hover:text-green-400 transition-colors"
              >
                View demo
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>

        <section className="container mx-auto px-5 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <LuRadioTower className="text-green-400 w-16 h-16" />,
                title: "Comprehensive Monitoring",
                description: "Get visibility into every part of your system, all in one place.",
                gradient: "from-green-400/20 to-green-500/20"
              },
              {
                icon: <IoMdAlert className="text-red-500 w-16 h-16" />,
                title: "Instant Alerts",
                description: "Real-time notifications to help you detect issues before they impact users.",
                gradient: "from-red-400/20 to-red-500/20"
              },
              {
                icon: <MdAutoGraph className="text-blue-400 w-16 h-16" />,
                title: "Detailed Analytics",
                description: "Gain insights from data and uncover trends with in-depth analytics.",
                gradient: "from-blue-400/20 to-blue-500/20"
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl ${feature.gradient}" />
                <div className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-card-foreground/10 hover:border-green-400/30 transition-all duration-300">
                  <div className="mb-6 transform transition-transform group-hover:scale-110 duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="container mx-auto px-5 py-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "Monitoring" },
              { number: "1M+", label: "Checks/day" },
              { number: "100%", label: "Free" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-card-foreground/10"
              >
                <h4 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  {stat.number}
                </h4>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}