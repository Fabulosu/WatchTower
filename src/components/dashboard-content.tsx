"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { IncidentsTab } from "./incidents-tab";
import { OpenIncidentsTab } from "./openincidents-tab";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { MaintenancesTab } from "./maintenances-tab";

export function DashboardContent({ pageData }: { pageData: { name: string; id: number; } | null; }) {
    if (!pageData) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-full flex items-center justify-center p-4"
            >
                <p className="text-muted-foreground text-lg text-center">
                    Select a page to view details.
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full px-4 sm:px-6 md:w-[80vw] mt-6 flex flex-col items-center"
        >
            <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-center">{pageData.name}</h2>
            </div>

            <Tabs defaultValue="open" className="w-full max-w-[90vw] sm:max-w-[50vw]">
                <TabsList className="grid w-full grid-cols-3 gap-2 sm:gap-4 rounded-xl p-1 bg-card/50 backdrop-blur-sm">
                    <TabsTrigger
                        value="open"
                        className="rounded-lg text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:text-black"
                    >
                        Open
                    </TabsTrigger>
                    <TabsTrigger
                        value="incidents"
                        className="rounded-lg text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:text-black"
                    >
                        Incidents
                    </TabsTrigger>
                    <TabsTrigger
                        value="maintenances"
                        className="rounded-lg text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:text-black"
                    >
                        Maintenances
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="open" className="mt-4 sm:mt-6">
                    <div className="rounded-xl bg-card/30 backdrop-blur-sm border border-card-foreground/10 p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-semibold mb-4">Open incidents</h3>
                        <OpenIncidentsTab pageId={pageData?.id} />
                    </div>
                </TabsContent>

                <TabsContent value="incidents" className="mt-4 sm:mt-6">
                    <div className="rounded-xl bg-card/30 backdrop-blur-sm border border-card-foreground/10 p-4 sm:p-6">
                        <div className="w-full flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mb-4">
                            <h3 className="text-lg sm:text-xl font-semibold">Incident History</h3>
                            <Link
                                href="incidents/create"
                                className={cn(
                                    buttonVariants({ variant: "default" }),
                                    "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm sm:text-base w-full sm:w-auto"
                                )}
                            >
                                Create Incident
                            </Link>
                        </div>
                        <IncidentsTab pageId={pageData?.id} />
                    </div>
                </TabsContent>

                <TabsContent value="maintenances" className="mt-4 sm:mt-6">
                    <div className="rounded-xl bg-card/30 backdrop-blur-sm border border-card-foreground/10 p-4 sm:p-6">
                        <div className="w-full flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mb-4">
                            <h3 className="text-lg sm:text-xl font-semibold">Maintenance History</h3>
                            <Link
                                href="incidents/schedule-maintenance"
                                className={cn(
                                    buttonVariants({ variant: "default" }),
                                    "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm sm:text-base w-full sm:w-auto"
                                )}
                            >
                                Schedule Maintenance
                            </Link>
                        </div>
                        <MaintenancesTab pageId={pageData?.id} />
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}