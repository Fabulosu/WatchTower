"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { IncidentsTab } from "./incidents-tab";
import { OpenIncidentsTab } from "./openincidents-tab";

export function DashboardContent({ pageData }: { pageData: { name: string; id: number; } | null; }) {
    console.log(pageData)
    if (!pageData) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-full flex items-center justify-center"
            >
                <p className="text-muted-foreground text-lg">
                    Select a page to view details.
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-[80vw] mt-6 flex flex-col items-center"
        >
            <div className="mb-6">
                <h2 className="text-2xl font-bold">{pageData.name}</h2>
            </div>

            <Tabs defaultValue="open" className="w-[50vw]">
                <TabsList className="grid w-full grid-cols-4 gap-4 rounded-xl p-1 bg-card/50 backdrop-blur-sm">
                    <TabsTrigger
                        value="open"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black"
                    >
                        Open
                    </TabsTrigger>
                    <TabsTrigger
                        value="incidents"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black"
                    >
                        Incidents
                    </TabsTrigger>
                    <TabsTrigger
                        value="maintenances"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black"
                    >
                        Maintenances
                    </TabsTrigger>
                    <TabsTrigger
                        value="templates"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black"
                    >
                        Templates
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="open" className="mt-6">
                    <div className="rounded-xl bg-card/30 backdrop-blur-sm border border-card-foreground/10 p-6">
                        <h3 className="text-xl font-semibold mb-4">Open incidents</h3>
                        <OpenIncidentsTab pageId={pageData?.id} />
                    </div>
                </TabsContent>

                <TabsContent value="incidents" className="mt-6">
                    <div className="rounded-xl bg-card/30 backdrop-blur-sm border border-card-foreground/10 p-6">
                        <h3 className="text-xl font-semibold mb-4">Incident History</h3>
                        <IncidentsTab pageId={pageData?.id} />
                    </div>
                </TabsContent>

                <TabsContent value="maintenances" className="mt-6">
                    <div className="rounded-xl bg-card/30 backdrop-blur-sm border border-card-foreground/10 p-6">
                        <h3 className="text-xl font-semibold mb-4">Maintenance History</h3>
                    </div>
                </TabsContent>

                <TabsContent value="templates" className="mt-6">
                    <div className="rounded-xl bg-card/30 backdrop-blur-sm border border-card-foreground/10 p-6">
                        <h3 className="text-xl font-semibold mb-4">Incident Templates</h3>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}