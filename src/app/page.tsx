import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { LuRadioTower } from "react-icons/lu";
import { IoMdAlert } from "react-icons/io";
import { MdAutoGraph } from "react-icons/md";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="bg-background text-foreground container mx-auto px-5 py-10 md:py-20 space-y-16">
        <section className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-snug">
            The world’s best free <span className="text-green-400">uptime monitoring</span> service.
          </h1>
          <p className="text-lg md:text-xl pb-6 text-muted-foreground max-w-2xl mx-auto">
            Everything is totally <span className="text-green-400 font-semibold">FREE</span>.
          </p>
          <Link
            href="/register"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full mt-4 text-lg font-semibold shadow-md transform hover:scale-105 transition duration-300"
          >
            Start monitoring your apps
          </Link>
        </section>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8">
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
            <div key={idx} className="flex flex-col items-center text-center space-y-4 p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
              {feature.icon}
              <h3 className="text-xl font-semibold text-foreground hover:cursor-default">{feature.title}</h3>
              <p className="text-muted-foreground hover:cursor-default">{feature.description}</p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}