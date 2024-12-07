import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { id: number } }) {
    redirect(`/pages/${params.id}/incidents`);
}