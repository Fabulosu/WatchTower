import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { IncidentsTab } from "./incidents-tab";

type DashboardContentProps = {
    pageData: any;
    selectedPage: { label: string; value: string; } | null;
};

export function DashboardContent({ pageData, selectedPage }: DashboardContentProps) {
    if (!selectedPage) {
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
                <h2 className="text-2xl font-bold">{selectedPage.label}</h2>
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
                    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl bg-card/30 backdrop-blur-sm border border-card-foreground/10">
                        <h3 className="text-2xl font-semibold mb-2">No open incidents</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            New incidents and scheduled maintenance events will appear here
                        </p>
                        <Button
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Open Incident
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="incidents" className="mt-6">
                    <div className="rounded-xl bg-card/30 backdrop-blur-sm border border-card-foreground/10 p-6">
                        <h3 className="text-xl font-semibold mb-4">Incident History</h3>
                        <IncidentsTab pageId={selectedPage?.value} />
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