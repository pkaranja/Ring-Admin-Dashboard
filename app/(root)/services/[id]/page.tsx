import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import BreadCrumb from "@/components/layout/breadcrumb";
import { getService } from '@/lib/actions/service.actions';
import { Service } from "@/types";
import ServiceForm from "@/components/forms/ServiceForm";

const breadcrumbItems = [{ title: "Services", link: "/services" }, { title: "New", link: "" } ];

const ServicePage = async ({ params }: { params: { id: string } }) => {
    let item: Service | null = null;

    if (params.id && params.id !== "new") {
        try {
            item = await getService(params.id);
        } catch (error) {
            throw new Error("Error loading data" + error);
        }
    }

    return (
        <>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <BreadCrumb items={breadcrumbItems} />

                <div className="flex items-start justify-between">
                    <Heading title={params.id ? `Edit service` : `Create service`} description={params.id ? "Edit your service" : "Add new service to your business"} />
                </div>
                <Separator />

                <ServiceForm item={item} />
            </div>
        </>
    );
};

export default ServicePage;